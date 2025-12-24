

const Chat = require('../models/Chat');
const PoSP = require('../models/PoSP');
const UserSession = require('../models/UserSession');
const fs = require('fs');
const path = require('path');

// Get messages for a specific chat
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phoneNumber, page = 1, limit = 50 } = req.query;
   
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
   
    // Find the chat with pagination
    const chat = await Chat.findOne({
      participants: { $all: [phoneNumber, userId] }
    });
    
    if (!chat) {
      return res.json({
        success: true,
        messages: [],
        hasMore: false
      });
    }
   
        // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const messages = chat.messages.slice(startIndex, endIndex);
    const hasMore = endIndex < chat.messages.length;
    
    res.json({
      success: true,
      messages,
      hasMore,
      totalMessages: chat.messages.length
    });

  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add a new function to edit messages
const editMessage = async (req, res) => {
  try {
    const { messageId, newMessage, userId } = req.body;
    
    if (!messageId || !newMessage || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find the chat containing the message
    const chat = await Chat.findOne({
      'messages._id': messageId,
      'messages.senderId': userId
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to edit it'
      });
    }
    
    // Find the message and update it
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Store the original message
    const originalMessage = message.message;
    
    // Update the message
    message.message = newMessage;
    message.edited = true;
    message.editedAt = new Date();
    
    // Save the chat
    await chat.save();
    
    // Notify the recipient about the edit
    const recipientId = chat.participants.find(p => p !== userId);
    req.io.emit(`messageEdited_${recipientId}`, {
      messageId,
      newMessage,
      editedAt: message.editedAt
    });
    
    res.json({
      success: true,
      message: 'Message edited successfully',
      data: {
        messageId,
        originalMessage,
        newMessage,
        editedAt: message.editedAt
      }
    });
  } catch (error) {
    console.error('Error in editMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// Send a message
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderName, receiverId, receiverName, message, isVoiceMessage } = req.body;
   
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
   
    // Find or create a chat between the two users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] }
    });
   
    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        unreadCount: new Map()
      });
    }
   
    // Create the new message
    const newMessage = {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      isVoiceMessage: isVoiceMessage || false,
      timestamp: new Date(),
      read: false
    };
   
    // Add the message to the chat
    chat.messages.push(newMessage);
    chat.lastMessage = isVoiceMessage ? 'Voice message' : message;
    chat.lastMessageTime = new Date();
   
    // Increment unread count for receiver
    const currentUnreadCount = chat.unreadCount.get(receiverId) || 0;
    chat.unreadCount.set(receiverId, currentUnreadCount + 1);
   
    // Save the chat
    await chat.save();
   
    // Log the message to a file
    await logMessageToFile(senderId, receiverId, newMessage);
   
    // Emit the message via Socket.IO
    req.io.emit(`message_${receiverId}`, newMessage);
   
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phoneNumber } = req.body;
   
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
   
    // Find the chat between the two users
    const chat = await Chat.findOne({
      participants: { $all: [phoneNumber, userId] }
    });
   
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }
   
    // Mark all messages from the other user as read
    chat.messages.forEach(msg => {
      if (msg.senderId === userId && msg.receiverId === phoneNumber) {
        msg.read = true;
      }
    });
   
    // Reset unread count for the current user
    chat.unreadCount.set(phoneNumber, 0);
   
    // Save the chat
    await chat.save();
   
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Log message to file
const logMessageToFile = async (user1Id, user2Id, message) => {
  try {
    // Create a unique filename for the chat log
    const sortedIds = [user1Id, user2Id].sort();
    const filename = `${sortedIds[0]}-${sortedIds[1]}-chat.log`;
    const logDir = path.join(__dirname, '../logs');
    const logPath = path.join(logDir, filename);
   
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
   
    // Format the log entry
    const logEntry = `[${new Date().toISOString()}] ${message.senderName} (${message.senderId}) to ${message.receiverName} (${message.receiverId}): ${message.message}\n`;
   
    // Append to the log file
    fs.appendFileSync(logPath, logEntry);
   
    console.log(`Message logged to ${filename}`);
  } catch (error) {
    console.error('Error logging message to file:', error);
  }
};


// Add a new function to search messages
const searchMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phoneNumber, query, page = 1, limit = 20 } = req.query;
    
    if (!phoneNumber || !query) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and search query are required'
      });
    }
    
    // Find the chat between the two users
    const chat = await Chat.findOne({
      participants: { $all: [phoneNumber, userId] }
    });
    
    if (!chat) {
      return res.json({
        success: true,
        messages: [],
        hasMore: false
      });
    }
    
    // Search for messages containing the query (case-insensitive)
    const regex = new RegExp(query, 'i');
    const allMatchingMessages = chat.messages.filter(msg => 
      regex.test(msg.message)
    );
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const messages = allMatchingMessages.slice(startIndex, endIndex);
    const hasMore = endIndex < allMatchingMessages.length;
    
    res.json({
      success: true,
      messages,
      hasMore,
      totalMessages: allMatchingMessages.length,
      query
    });
  } catch (error) {
    console.error('Error in searchMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  editMessage,
  searchMessages
};