// // const mongoose = require('mongoose');

// // const userSessionSchema = new mongoose.Schema({
// //   phoneNumber: {
// //     type: String,
// //     required: true,
// //     unique: true
// //   },
// //   status: {
// //     type: String,
// //     enum: ['login', 'logout'],
// //     default: 'logout'
// //   },
// //   otp: String,
// //   otpExpires: Date,
// //   lastSeen: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   isTyping: {
// //     type: Boolean,
// //     default: false
// //   }
// // }, {
// //   timestamps: true
// // });

// // const UserSession = mongoose.model('UserSession', userSessionSchema);

// // module.exports = UserSession;


// // // UserSession.js
// // const mongoose = require('mongoose');

// // const userSessionSchema = new mongoose.Schema({
// //   phoneNumber: {
// //     type: String,
// //     required: true,
// //     unique: true
// //   },
// //   status: {
// //     type: String,
// //     enum: ['online', 'offline'], // <-- Use these values
// //     default: 'offline'
// //   },
// //   otp: String,
// //   otpExpires: Date,
// //   lastSeen: {
// //     type: Date,
// //     default: Date.now
// //   },
// //   isTyping: {
// //     type: Boolean,
// //     default: false
// //   }
// // }, {
// //   timestamps: true
// // });

// // const UserSession = mongoose.model('UserSession', userSessionSchema);

// // module.exports = UserSession;



// const mongoose = require('mongoose');

// const userSessionSchema = new mongoose.Schema({
//   phoneNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   status: {
//     type: String,
//     // FIX: Include all four status values
//     enum: ['login', 'logout', 'online', 'offline'], 
//     default: 'offline'
//   },
//   otp: String,
//   otpExpires: Date,
//   lastSeen: {
//     type: Date,
//     default: Date.now
//   },
//   isTyping: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// const UserSession = mongoose.model('UserSession', userSessionSchema);

// module.exports = UserSession;


const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  // 1. Authentication State: Managed by OTP
  authStatus: {
    type: String,
    enum: ['login', 'logout'],
    default: 'logout'
  },
  // 2. Presence State: Managed by Socket.IO
  presenceStatus: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  otp: String,
  otpExpires: Date,
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isTyping: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const UserSession = mongoose.model('UserSession', userSessionSchema);

module.exports = UserSession;