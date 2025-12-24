
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageTime: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} }
});

// Create a compound index on participants for efficient lookups
chatSchema.index({ participants: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;