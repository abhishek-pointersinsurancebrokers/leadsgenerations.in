
const UserSession = require('../models/UserSession');
const PoSP = require('../models/PoSP');

const generateOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  console.log(`Generated OTP: ${otp}`);
  return otp;
};

const saveOTP = async (phoneNumber) => {
  // Check if user exists in PoSP collection
  const user = await PoSP.findOne({ PhoneNumber: phoneNumber });
  
  if (!user) {
    throw new Error('Number not registered');
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Find or create user session
  let userSession = await UserSession.findOne({ phoneNumber });
  
  if (!userSession) {
    userSession = new UserSession({ phoneNumber });
  }

  // Update OTP and expiry
  userSession.otp = otp;
  userSession.otpExpires = otpExpires;
  userSession.authStatus = 'logout'; // Ensure status is logout when requesting OTP
  
  await userSession.save();

  return { otp, user };
};

const verifyOTP = async (phoneNumber, otp) => {
  // Check if user exists in PoSP collection
  const user = await PoSP.findOne({ PhoneNumber: phoneNumber });
  
  if (!user) {
    throw new Error('Number not registered');
  }

  // Find user session
  const userSession = await UserSession.findOne({ phoneNumber });
  
  if (!userSession) {
    throw new Error('No OTP requested for this number');
  }

  if (userSession.authStatus === "login") {
    throw new Error('User already logged in');
  }

  if (userSession.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  if (userSession.otpExpires && userSession.otpExpires < Date.now()) {
    throw new Error('Expired OTP');
  }

  // Update session to logged in
  userSession.authStatus = "login";
  userSession.lastSeen = new Date();
  userSession.otp = undefined;
  userSession.otpExpires = undefined;
  
  await userSession.save();

  return { user, userSession };
};

const checkUserStatus = async (phoneNumber) => {
  // Check if user exists in PoSP collection
  const user = await PoSP.findOne({ PhoneNumber: phoneNumber });
  
  if (!user) {
    throw new Error('Number not registered');
  }

  // Find user session
  const userSession = await UserSession.findOne({ phoneNumber });
  
  // If no session exists, user is logged out
  if (!userSession) {
    return { user, authStatus: 'logout' };
  }

  return { user, authStatus: userSession.authStatus };
};

module.exports = {
  generateOTP,
  saveOTP,
  verifyOTP,
  checkUserStatus
};