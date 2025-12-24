// const PoSP = require('../models/PoSP');
// const UserSession = require('../models/UserSession');
// const { saveOTP, verifyOTP, checkUserStatus } = require('../services/otpService');
// const { sendOTP } = require('../services/smsService');
// const { findRelatedUsers } = require('./userController'); // Import the findRelatedUsers function

// const checkUserStatusController = async (req, res) => {
//   const { phoneNumber } = req.body;
//   console.log(`\n=== USER STATUS CHECK ===`);
//   console.log(`Phone Number: ${phoneNumber}`);
 
//   try {
//     const { user, authStatus } = await checkUserStatus(phoneNumber);
   
//     console.log(`User found:`, {
//       id: user._id,
//       name: user.Name,
//       phone: user.PhoneNumber,
//       authStatus: authStatus
//     });
   
//     // Return user status and user data if logged in
//     if (authStatus === "login") {
//       // Get related users to find the Sales Manager
//       const relatedUsersResult = await findRelatedUsers(phoneNumber);
//       let salesManagerPhone = null;
      
//       // Extract Sales Manager's phone number based on user type
//       if (relatedUsersResult.found) {
//         if (relatedUsersResult.userType === 'POS' || relatedUsersResult.userType === 'POS Referrel') {
//           // For POS users, find their Sales Manager
//           const salesManager = relatedUsersResult.relatedUsers.find(
//             user => user.designation === 'Sales Manager' || user.designation === 'Sales Manager '
//           );
//           if (salesManager) {
//             salesManagerPhone = salesManager.phoneNumber;
//           }
//         }
//       }
      
//       const userData = {
//         name: user.Name,
//         username: user.username,
//         phoneNumber: user.PhoneNumber,
//         designation: user.Designation,
//         authStatus: authStatus,
//         crm_name: user.crm_name,
//         crm_id: user.crm_id,
//         salesManagerPhone: salesManagerPhone // Add Sales Manager's phone number
//       };
     
//       console.log(`User is logged in. Returning user data:`, userData);
//       return res.json({
//         success: true,
//         authStatus: "login",
//         user: userData
//       });
//     } else {
//       console.log(`User is not logged in. Status: ${authStatus}`);
//       return res.json({
//         success: true,
//         authStatus: "logout"
//       });
//     }
//   } catch (error) {
//     console.error('Error in checkUserStatus:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// const requestOTP = async (req, res) => {
//   const { phoneNumber } = req.body;
//   console.log(`\n=== OTP REQUEST ===`);
//   console.log(`Phone Number: ${phoneNumber}`);
 
//   try {
//     // Check if user is already logged in
//     const { user, authStatus } = await checkUserStatus(phoneNumber);
    
//     if (authStatus === "login") {
//       console.log(`User already logged in with authStatus: ${authStatus}`);
      
//       // Get related users to find the Sales Manager
//       const relatedUsersResult = await findRelatedUsers(phoneNumber);
//       let salesManagerPhone = null;
      
//       // Extract Sales Manager's phone number based on user type
//       if (relatedUsersResult.found) {
//         if (relatedUsersResult.userType === 'POS' || relatedUsersResult.userType === 'POS Referrel') {
//           // For POS users, find their Sales Manager
//           const salesManager = relatedUsersResult.relatedUsers.find(
//             user => user.designation === 'Sales Manager' || user.designation === 'Sales Manager '
//           );
//           if (salesManager) {
//             salesManagerPhone = salesManager.phoneNumber;
//           }
//         }
//       }
      
//       const userData = {
//         name: user.Name,
//         username: user.username,
//         phoneNumber: user.PhoneNumber,
//         designation: user.Designation,
//         authStatus: authStatus,
//         salesManagerPhone: salesManagerPhone // Add Sales Manager's phone number
//       };
//       return res.json({
//         success: true,
//         alreadyLoggedIn: true,
//         message: 'User already logged in',
//         user: userData
//       });
//     }
    
//     const { otp } = await saveOTP(phoneNumber);
   
//     console.log(`OTP saved for user:`, {
//       phone: phoneNumber,
//       otp: otp
//     });
   
//     const smsSent = await sendOTP(phoneNumber, otp);
   
//     if (smsSent) {
//       console.log(`OTP request successful for ${phoneNumber}`);
//       res.json({ success: true, message: 'OTP sent successfully' });
//     } else {
//       console.log(`Failed to send SMS to ${phoneNumber}`);
//       res.status(500).json({ success: false, message: 'Failed to send OTP' });
//     }
//   } catch (error) {
//     console.error('Error in requestOTP:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const verifyOTPController = async (req, res) => {
//   const { phoneNumber, otp } = req.body;
//   console.log(`\n=== OTP VERIFICATION ===`);
//   console.log(`Phone Number: ${phoneNumber}`);
//   console.log(`Entered OTP: ${otp}`);
 
//   try {
//     const { user } = await verifyOTP(phoneNumber, otp);
   
//     console.log(`OTP verified successfully for ${phoneNumber}`);
//     console.log(`User status updated to: login`);
   
//     // Get related users to find the Sales Manager
//     const relatedUsersResult = await findRelatedUsers(phoneNumber);
//     let salesManagerPhone = null;
    
//     // Extract Sales Manager's phone number based on user type
//     if (relatedUsersResult.found) {
//       if (relatedUsersResult.userType === 'POS' || relatedUsersResult.userType === 'POS Referrel') {
//         // For POS users, find their Sales Manager
//         const salesManager = relatedUsersResult.relatedUsers.find(
//           user => user.designation === 'Sales Manager' || user.designation === 'Sales Manager '
//         );
//         if (salesManager) {
//           salesManagerPhone = salesManager.phoneNumber;
//         }
//       }
//     }
   
//     // Prepare user data to send to frontend
//     const userData = {
//       name: user.Name,
//       username: user.username,
//       phoneNumber: user.PhoneNumber,
//       designation: user.Designation,
//       authStatus: 'login',
//       salesManagerPhone: salesManagerPhone // Add Sales Manager's phone number
//     };
   
//     // Log the user data being sent to frontend
//     console.log(`\n=== USER DATA SENT TO FRONTEND ===`);
//     console.log(`Name: ${userData.name}`);
//     console.log(`Username: ${userData.username}`);
//     console.log(`Phone: ${userData.phoneNumber}`);
//     console.log(`Designation: ${userData.designation}`);
//     console.log(`Sales Manager Phone: ${userData.salesManagerPhone}`);
//     console.log(`===================================\n`);
   
//     res.json({
//       success: true,
//       message: 'OTP verified successfully',
//       user: userData
//     });
//   } catch (error) {
//     console.error('Error in verifyOTPController:', error);
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


// const logout = async (req, res) => {
//   const { phoneNumber } = req.body;
//   console.log(`\n=== LOGOUT REQUEST ===`);
//   console.log(`Phone Number: ${phoneNumber}`);
  
//   try {
//     // Find the user session
//     const userSession = await UserSession.findOne({ phoneNumber });
    
//     if (!userSession) {
//       console.log(`No active session found for ${phoneNumber}`);
//       return res.status(404).json({ 
//         success: false, 
//         message: 'No active session found' 
//       });
//     }
    
//     // Update auth status to logout
//     userSession.authStatus = 'logout';
//     await userSession.save();
    
//     console.log(`User ${phoneNumber} logged out successfully`);
    
//     res.json({
//       success: true,
//       message: 'Logged out successfully'
//     });
//   } catch (error) {
//     console.error('Error in logout:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error during logout' 
//     });
//   }
// };

// module.exports = {
//   checkUserStatus: checkUserStatusController,
//   requestOTP,
//   verifyOTP: verifyOTPController,
//   logout
// };




const PoSP = require('../models/PoSP');
const UserSession = require('../models/UserSession');
const { saveOTP, verifyOTP } = require('../services/otpService'); // checkUserStatus import removed
const { sendOTP } = require('../services/smsService');
const { findRelatedUsers } = require('./userController'); // Import the findRelatedUsers function

// The checkUserStatusController function has been removed.

const requestOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(`\n=== OTP REQUEST ===`);
  console.log(`Phone Number: ${phoneNumber}`);
 
  try {
    // Always generate and send a new OTP for login
    const { otp } = await saveOTP(phoneNumber);
   
    console.log(`OTP saved for user:`, {
      phone: phoneNumber,
      otp: otp
    });
   
    const smsSent = await sendOTP(phoneNumber, otp);
   
    if (smsSent) {
      console.log(`OTP request successful for ${phoneNumber}`);
      res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      console.log(`Failed to send SMS to ${phoneNumber}`);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
  } catch (error) {
    console.error('Error in requestOTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOTPController = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  console.log(`\n=== OTP VERIFICATION ===`);
  console.log(`Phone Number: ${phoneNumber}`);
  console.log(`Entered OTP: ${otp}`);
 
  try {
    const { user } = await verifyOTP(phoneNumber, otp);
   
    console.log(`OTP verified successfully for ${phoneNumber}`);
    console.log(`User status updated to: login`);
   
    // Get related users to find the Sales Manager
    const relatedUsersResult = await findRelatedUsers(phoneNumber);
    let salesManagerPhone = null;
    
    // Extract Sales Manager's phone number based on user type
    if (relatedUsersResult.found) {
      if (relatedUsersResult.userType === 'POS' || relatedUsersResult.userType === 'POS Referrel') {
        // For POS users, find their Sales Manager
        const salesManager = relatedUsersResult.relatedUsers.find(
          user => user.designation === 'Sales Manager' || user.designation === 'Sales Manager '
        );
        if (salesManager) {
          salesManagerPhone = salesManager.phoneNumber;
        }
      }
    }
   
    // Prepare user data to send to frontend
    const userData = {
      name: user.Name,
      username: user.username,
      phoneNumber: user.PhoneNumber,
      designation: user.Designation,
      authStatus: 'login',
      crm_name: user.crm_name,
      crm_id: user.crm_id,
      salesManagerPhone: salesManagerPhone // Add Sales Manager's phone number
    };
   
    // Log the user data being sent to frontend
    console.log(`\n=== USER DATA SENT TO FRONTEND ===`);
    console.log(`Name: ${userData.name}`);
    console.log(`Username: ${userData.username}`);
    console.log(`Phone: ${userData.phoneNumber}`);
    console.log(`Designation: ${userData.designation}`);
    console.log(`Sales Manager Phone: ${userData.salesManagerPhone}`);
    console.log(`===================================\n`);
   
    res.json({
      success: true,
      message: 'OTP verified successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error in verifyOTPController:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};


const logout = async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(`\n=== LOGOUT REQUEST ===`);
  console.log(`Phone Number: ${phoneNumber}`);
  
  try {
    // Find the user session
    const userSession = await UserSession.findOne({ phoneNumber });
    
    if (!userSession) {
      console.log(`No active session found for ${phoneNumber}`);
      return res.status(404).json({ 
        success: false, 
        message: 'No active session found' 
      });
    }
    
    // Update auth status to logout
    userSession.authStatus = 'logout';
    await userSession.save();
    
    console.log(`User ${phoneNumber} logged out successfully`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during logout' 
    });
  }
};

module.exports = {
  // checkUserStatus: checkUserStatusController, // Removed
  requestOTP,
  verifyOTP: verifyOTPController,
  logout
};