
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: String,
  Name: String,
  username: String,
  email: String,
  PhoneNumber: String,
  Designation: String,
  Branch: String,
  'Registration Date': String,
  ss_id: String,
  // Optional fields that may not exist in all documents
  Status: {
    type: String,
    enum: ['login', 'offline'],
    default: 'offline'
  },
  manager: {
    name: String,
    username: String
  },
  ss: String,
  assignedPoSP: [String],
  isTyping: {
    type: Boolean,
    default: false
  },
  lastSeen: Date,
  // OTP fields - make them optional
  otp: String,
  otpExpires: Date
}, { 
  collection: 'PoSP',
  // This option helps with schema mismatches
  strict: false 
});

const User = mongoose.model('User', userSchema);

module.exports = User;