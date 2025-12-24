
const express = require('express');
const router = express.Router();
const { checkUserStatus, requestOTP, verifyOTP, logout } = require('../controllers/authController');

// User status check route
// router.post('/user-status', checkUserStatus);

// Request OTP route
router.post('/request-otp', requestOTP);

// Verify OTP route
router.post('/verify-otp', verifyOTP);

// Logout route (add this)
router.post('/logout', logout);

module.exports = router;