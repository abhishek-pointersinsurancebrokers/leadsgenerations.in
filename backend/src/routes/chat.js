
const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  editMessage
} = require('../controllers/chatController');


// Get messages for a specific chat
router.get('/messages/:userId', getMessages);

// Send a message
router.post('/send', sendMessage);

// Mark messages as read
router.post('/read/:userId', markMessagesAsRead);

// NEW ROUTE: Edit message
router.post('/edit', editMessage);

module.exports = router;