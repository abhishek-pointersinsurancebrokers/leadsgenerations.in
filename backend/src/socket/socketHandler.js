// const PoSP = require("../models/PoSP");
// const UserSession = require("../models/UserSession");

// module.exports = (io) => {
//   io.on("connection",async (socket) => {
//     console.log("New client connected");

//     // Extract user ID from the socket query (from client connection)
//     const userId = socket.handshake.query.phoneNumber;

//     if (userId) {
//       // Join a room based on user ID
//       socket.join(userId);
//       console.log(`User ${userId} joined their room`);
      
//       // Update presence status to online
//       await updateUserStatus(userId, 'online');
      
//       // 1. Tell everyone else: "I'm online"
//     socket.broadcast.emit('userStatusChanged', {
//       userId,
//       presenceStatus: 'online',
//       timestamp: new Date()
//     });

//       // Broadcast the new presence status to ALL others
//       broadcastPresenceStatus(io, userId, 'online');

//       // 2. Tell ME who else is online → THIS FIXES YOUR BUG
//     await syncOnlineUsersToNewClient(socket);

//     }

//     // Handle sending messages
//     socket.on("sendMessage", async (data) => {
//       try {
//         const { senderId, senderName, receiverId, receiverName, message } =
//           data;

//         // Find or create a chat between the two users
//         const Chat = require("../models/Chat");
//         let chat = await Chat.findOne({
//           participants: { $all: [senderId, receiverId] },
//         });

//         if (!chat) {
//           chat = new Chat({
//             participants: [senderId, receiverId],
//             unreadCount: new Map(),
//           });
//         }

//         // Create the new message
//         const newMessage = {
//           senderId,
//           senderName,
//           receiverId,
//           receiverName,
//           message,
//           timestamp: new Date(),
//           read: false,
//         };

//         // Add the message to the chat
//         chat.messages.push(newMessage);
//         chat.lastMessage = message;
//         chat.lastMessageTime = new Date();

//         // Increment unread count for receiver
//         const currentUnreadCount = chat.unreadCount.get(receiverId) || 0;
//         chat.unreadCount.set(receiverId, currentUnreadCount + 1);

//         // Save the chat
//         await chat.save();

//         // Emit the message to the receiver
//         io.to(receiverId).emit(`message_${receiverId}`, newMessage);

//         // Confirm to sender that message was sent and delivered
//         socket.emit("messageDelivered", {
//           success: true,
//           messageId: newMessage._id,
//           timestamp: new Date(),
//         });

//         // Also notify when the message is read
//         socket.on(`messageRead_${senderId}`, (data) => {
//           io.to(senderId).emit("messageReadStatus", {
//             messageId: data.messageId,
//             read: true,
//             timestamp: new Date(),
//           });
//         });
//       } catch (error) {
//         console.error("Error sending message:", error);
//         socket.emit("messageSent", { success: false, error: error.message });
//       }
//     });

//     // Handle typing indicators
//     socket.on("typing", async (data) => {
//       const { userId, isTyping, recipientId } = data;

//       // Update user typing status
//       await updateUserTypingStatus(userId, isTyping);

//       // Send specifically to the recipient
//       if (recipientId) {
//         io.to(recipientId).emit("typing", { userId, isTyping });
//       }
//     });

// // Handle marking messages as read
// socket.on("markAsRead", async (data) => {
//   try {
//     const { userId, recipientId } = data; // userId = current user (who opened chat), recipientId = the other person (sender of unread msgs)

//     const Chat = require("../models/Chat");
//     const chat = await Chat.findOne({
//       participants: { $all: [userId, recipientId] },
//     });

//     if (!chat) return;

//     let hasUnreadMessages = false;

//     // Mark all messages from recipient → user as read
//     chat.messages.forEach((msg) => {
//       if (msg.senderId === recipientId && msg.receiverId === userId && !msg.read) {
//         msg.read = true;
//         hasUnreadMessages = true;

//         // Emit individual read receipt for each message (for precise blue ticks)
//         io.to(recipientId).emit(`messageRead_${recipientId}`, {
//           messageId: msg._id.toString(),
//         });
//       }
//     });

//     // Optional: Also emit a bulk event if you want
//     if (hasUnreadMessages) {
//       io.to(recipientId).emit(`messagesMarkedRead_${recipientId}`, {});
//     }

//     await chat.save();

//     console.log(`Messages read by ${userId} from ${recipientId} → notified sender`);
//   } catch (error) {
//     console.error("Error in markAsRead:", error);
//   }
// });


//     // Handle sending messages
// socket.on("sendMessage", async (data) => {
//   try {
//     const { senderId, senderName, receiverId, receiverName, message } = data;

//     const Chat = require("../models/Chat");
//     let chat = await Chat.findOne({
//       participants: { $all: [senderId, receiverId] },
//     });

//     if (!chat) {
//       chat = new Chat({
//         participants: [senderId, receiverId],
//         unreadCount: new Map(),
//       });
//     }

//     const newMessage = {
//       _id: new mongoose.Types.ObjectId(), // Important: generate ID early
//       senderId,
//       senderName,
//       receiverId,
//       receiverName,
//       message,
//       timestamp: new Date(),
//       read: false,
//       delivered: false,
//     };

//     chat.messages.push(newMessage);
//     chat.lastMessage = message;
//     chat.lastMessageTime = new Date();

//     // Increment unread for receiver
//     const currentUnread = chat.unreadCount.get(receiverId) || 0;
//     chat.unreadCount.set(receiverId, currentUnread + 1);

//     await chat.save();

//     // Emit to receiver
//     io.to(receiverId).emit(`message_${receiverId}`, newMessage);

//     // CRITICAL: Emit delivery confirmation to SENDER using correct event
//     socket.emit(`messageDelivered_${senderId}`, {
//       messageId: newMessage._id.toString(),
//     });

//     console.log("Message delivered event sent to sender:", senderId);
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// });

//  socket.on("disconnect", async () => {
//   console.log("Client disconnected");

//   if (userId) {
//     // Add a small delay to handle the case of page reloads
//     setTimeout(async () => {
//       // Check if user has any other connections
//       const sockets = await io.in(userId).fetchSockets();
//       const userStillConnected = sockets.length > 0;

//       // If no more connections for this user, update status to offline
//       if (!userStillConnected) {
//         updateUserStatus(userId, 'offline');
//         // Broadcast the new presence status to ALL others
//         broadcastPresenceStatus(io, userId, 'offline');
//       }
//     }, 1000); // 1 second delay
//   }
// });
//   });
// };

// function broadcastPresenceStatus(io, userId, presenceStatus) {
//   try {
//     // Use io.emit() to send the status update to every connected client.
//     // This is a simple broadcast without needing to query the database.
//     io.emit('userStatusChanged', {
//       userId: userId,
//       presenceStatus: presenceStatus, // The status of the user who changed ('online' or 'offline')
//       timestamp: new Date()
//     });
//     console.log(`Broadcasted status change for user ${userId} to ${presenceStatus} to all connected users.`);
//   } catch (error) {
//     console.error(`Error broadcasting user presence status for user ${userId}:`, error);
//   }
// }

// // Helper function to update user status in the database
// async function updateUserStatus(userId, status) {
//   try {
//     // Find or create user session
//     let userSession = await UserSession.findOne({ phoneNumber: userId });
    
//     if (!userSession) {
//       userSession = new UserSession({ phoneNumber: userId });
//     }
    
//     // Update status (now 'online' or 'offline' will be valid)
//     userSession.presenceStatus = status; 
//     userSession.lastSeen = new Date();
    
//     await userSession.save();
    
//     console.log(`Updated user ${userId} status to ${status}`);
//   } catch (error) {
//     console.error('Error updating user status:', error);
//   }
// }

// // Helper function to update user typing status
// async function updateUserTypingStatus(userId, isTyping) {
//   try {
//     // Find user session
//     let userSession = await UserSession.findOne({ phoneNumber: userId });
    
//     if (!userSession) {
//       userSession = new UserSession({ phoneNumber: userId });
//     }
    
//     // Update typing status
//     userSession.isTyping = isTyping;
    
//     await userSession.save();
    
//     console.log(`Updated user ${userId} typing status to ${isTyping}`);
//   } catch (error) {
//     console.error('Error updating user typing status:', error);
//   }
// }


// // BEST & SIMPLEST SOLUTION (2025 standard)
// async function syncOnlineUsersToNewClient(socket) {
//   try {
//     const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

//     const onlineSessions = await UserSession.find({
//       presenceStatus: 'online',
//       lastSeen: { $gte: oneMinuteAgo }  // Only users active in last 60s
//     });

//     const onlineList = onlineSessions.map(s => ({
//       userId: s.phoneNumber,
//       presenceStatus: 'online',
//       timestamp: s.lastSeen
//     }));

//     // Send full list ONLY to the new user
//     socket.emit('onlineUsersSync', onlineList);
//     console.log(`Synced ${onlineList.length} online users to ${socket.handshake.query.phoneNumber}`);
//   } catch (err) {
//     console.error("Failed to sync online users:", err);
//   }
// }




const PoSP = require("../models/PoSP");
const UserSession = require("../models/UserSession");
const mongoose = require('mongoose');

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected");

    // Extract user ID from the socket query (from client connection)
    const userId = socket.handshake.query.phoneNumber;

    if (userId) {
      // Join a room based on user ID
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
      
      // Update presence status to online
      await updateUserStatus(userId, 'online');
      
      // 1. Tell everyone else: "I'm online"
      socket.broadcast.emit('userStatusChanged', {
        userId,
        presenceStatus: 'online',
        timestamp: new Date()
      });

      // Broadcast the new presence status to ALL others
      broadcastPresenceStatus(io, userId, 'online');

      // 2. Tell ME who else is online → THIS FIXES YOUR BUG
      await syncOnlineUsersToNewClient(socket);
    }

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, senderName, receiverId, receiverName, message } = data;

        // Find or create a chat between the two users
        const Chat = require("../models/Chat");
        let chat = await Chat.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [senderId, receiverId],
            unreadCount: new Map(),
          });
        }

        // Create the new message
        const newMessage = {
          _id: new mongoose.Types.ObjectId(), // Important: generate ID early
          senderId,
          senderName,
          receiverId,
          receiverName,
          message,
          timestamp: new Date(),
          read: false,
          delivered: false,
        };

        // Add the message to the chat
        chat.messages.push(newMessage);
        chat.lastMessage = message;
        chat.lastMessageTime = new Date();

        // Increment unread count for receiver
        const currentUnreadCount = chat.unreadCount.get(receiverId) || 0;
        chat.unreadCount.set(receiverId, currentUnreadCount + 1);

        // Save the chat
        await chat.save();

        // Emit the message to the receiver
        io.to(receiverId).emit(`message_${receiverId}`, newMessage);

        // Confirm to sender that message was sent and delivered
        socket.emit(`messageDelivered_${senderId}`, {
          messageId: newMessage._id.toString(),
        });

        // Also notify when the message is read
        socket.on(`messageRead_${senderId}`, (data) => {
          io.to(senderId).emit("messageReadStatus", {
            messageId: data.messageId,
            read: true,
            timestamp: new Date(),
          });
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("messageSent", { success: false, error: error.message });
      }
    });

    // Handle typing indicators
    socket.on("typing", async (data) => {
      const { userId, isTyping, recipientId } = data;

      // Update user typing status
      await updateUserTypingStatus(userId, isTyping);

      // Send specifically to the recipient
      if (recipientId) {
        io.to(recipientId).emit("typing", { userId, isTyping });
      }
    });

    // Handle marking messages as read
    socket.on("markAsRead", async (data) => {
      try {
        const { userId, recipientId } = data; // userId = current user (who opened chat), recipientId = the other person (sender of unread msgs)

        const Chat = require("../models/Chat");
        const chat = await Chat.findOne({
          participants: { $all: [userId, recipientId] },
        });

        if (!chat) return;

        let hasUnreadMessages = false;

        // Mark all messages from recipient → user as read
        chat.messages.forEach((msg) => {
          if (msg.senderId === recipientId && msg.receiverId === userId && !msg.read) {
            msg.read = true;
            hasUnreadMessages = true;

            // Emit individual read receipt for each message (for precise blue ticks)
            io.to(recipientId).emit(`messageRead_${recipientId}`, {
              messageId: msg._id.toString(),
            });
          }
        });

        // Optional: Also emit a bulk event if you want
        if (hasUnreadMessages) {
          io.to(recipientId).emit(`messagesMarkedRead_${recipientId}`, {});
        }

        await chat.save();

        console.log(`Messages read by ${userId} from ${recipientId} → notified sender`);
      } catch (error) {
        console.error("Error in markAsRead:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected");

      if (userId) {
        // Add a small delay to handle the case of page reloads
        setTimeout(async () => {
          // Check if user has any other connections
          const sockets = await io.in(userId).fetchSockets();
          const userStillConnected = sockets.length > 0;

          // If no more connections for this user, update status to offline
          if (!userStillConnected) {
            updateUserStatus(userId, 'offline');
            // Broadcast the new presence status to ALL others
            broadcastPresenceStatus(io, userId, 'offline');
          }
        }, 1000); // 1 second delay
      }
    });
  });
};

function broadcastPresenceStatus(io, userId, presenceStatus) {
  try {
    // Use io.emit() to send the status update to every connected client.
    // This is a simple broadcast without needing to query the database.
    io.emit('userStatusChanged', {
      userId: userId,
      presenceStatus: presenceStatus, // The status of the user who changed ('online' or 'offline')
      timestamp: new Date()
    });
    console.log(`Broadcasted status change for user ${userId} to ${presenceStatus} to all connected users.`);
  } catch (error) {
    console.error(`Error broadcasting user presence status for user ${userId}:`, error);
  }
}

// Helper function to update user status in the database
async function updateUserStatus(userId, status) {
  try {
    // Find or create user session
    let userSession = await UserSession.findOne({ phoneNumber: userId });
    
    if (!userSession) {
      userSession = new UserSession({ phoneNumber: userId });
    }
    
    // Update status (now 'online' or 'offline' will be valid)
    userSession.presenceStatus = status; 
    userSession.lastSeen = new Date();
    
    await userSession.save();
    
    console.log(`Updated user ${userId} status to ${status}`);
  } catch (error) {
    console.error('Error updating user status:', error);
  }
}

// Helper function to update user typing status
async function updateUserTypingStatus(userId, isTyping) {
  try {
    // Find user session
    let userSession = await UserSession.findOne({ phoneNumber: userId });
    
    if (!userSession) {
      userSession = new UserSession({ phoneNumber: userId });
    }
    
    // Update typing status
    userSession.isTyping = isTyping;
    
    await userSession.save();
    
    console.log(`Updated user ${userId} typing status to ${isTyping}`);
  } catch (error) {
    console.error('Error updating user typing status:', error);
  }
}

// BEST & SIMPLEST SOLUTION (2025 standard)
async function syncOnlineUsersToNewClient(socket) {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const onlineSessions = await UserSession.find({
      presenceStatus: 'online',
      lastSeen: { $gte: oneMinuteAgo }  // Only users active in last 60s
    });

    const onlineList = onlineSessions.map(s => ({
      userId: s.phoneNumber,
      presenceStatus: 'online',
      timestamp: s.lastSeen
    }));

    // Send full list ONLY to the new user
    socket.emit('onlineUsersSync', onlineList);
    console.log(`Synced ${onlineList.length} online users to ${socket.handshake.query.phoneNumber}`);
  } catch (err) {
    console.error("Failed to sync online users:", err);
  }
}