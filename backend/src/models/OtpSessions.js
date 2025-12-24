// models/OtpSession.js
const mongoose = require('mongoose');

const otpSessionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 300 // TTL index for 5 minutes
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index for efficient lookups
otpSessionSchema.index({ phoneNumber: 1, isVerified: 1 });

const OtpSession = mongoose.model('OtpSession', otpSessionSchema);

module.exports = OtpSession;