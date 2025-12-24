
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const PoSP = require('../models/PoSP'); // Adjust path as needed
const UserSession = require('../models/UserSession'); // Adjust path as needed

// Path to store the JSON file
const JSON_FILE_PATH = path.join(__dirname, 'userRelationships.json');

/**
 * Fetches all users from the database and structures them according to the required format
 */
async function buildUserRelationships() {
  try {
    console.log('Starting to build user relationships...');
    
    // Get all SS users
    const ssUsers = await PoSP.find({ Designation: 'SS' }).select('Name username PhoneNumber Designation');
    
    const result = {};
    
    // Process each SS user
    for (const ssUser of ssUsers) {
      const ssKey = ssUser.Name;
      result[ssKey] = {
        Name: ssUser.Name,
        userName: ssUser.username,
        PhoneNumber: ssUser.PhoneNumber, // Add phone number for easier lookup
        relatedUsers: []
      };
      
      // Get all Sales Managers and POS users under this SS
      const salesManagers = await PoSP.find({
        Designation: { $in: ['Sales Manager', 'Sales Manager '] }
      }).select('Name username PhoneNumber Designation');
      
      const posUsers = await PoSP.find({
        Designation: { $in: ['POS', 'POS Referrel'] }
      }).select('Name username PhoneNumber Designation crm_id');
      
      // Create a map of POS users by their manager's username
      const posByManager = {};
      posUsers.forEach(pos => {
        if (pos.crm_id) {
          if (!posByManager[pos.crm_id]) {
            posByManager[pos.crm_id] = [];
          }
          posByManager[pos.crm_id].push(pos.PhoneNumber);
        }
      });
      
      // Process each Sales Manager
      const relatedUsersMap = {};
      for (const sm of salesManagers) {
        const relatedPOS = posByManager[sm.username] || [];
        relatedUsersMap[sm.PhoneNumber] = [
          sm.username,
          sm.Name,
          sm.Designation,
          {
            relatedPOS: relatedPOS
          }
        ];
      }
      
      // Process each POS user
      for (const pos of posUsers) {
        relatedUsersMap[pos.PhoneNumber] = [
          pos.username,
          pos.Name,
          pos.Designation
        ];
      }
      
      // Convert the map to an array of objects
      const relatedUsersArray = [relatedUsersMap];
      result[ssKey].relatedUsers = relatedUsersArray;
    }
    
    // Write the result to a JSON file
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(result, null, 2));
    console.log('User relationships JSON file updated successfully');
    
    return result;
  } catch (error) {
    console.error('Error building user relationships:', error);
    throw error;
  }
}

/**
 * Reads the user relationships from the JSON file
 */
function readUserRelationships() {
  try {
    if (!fs.existsSync(JSON_FILE_PATH)) {
      console.log('JSON file does not exist, creating a new one...');
      return buildUserRelationships();
    }
    
    const data = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user relationships:', error);
    // If there's an error reading the file, try to rebuild it
    return buildUserRelationships();
  }
}

exports.findRelatedUsers = async (phoneNumber) => {
  try {
    console.log(`Searching for relations of phone number: ${phoneNumber}`);
    
    // Read the user relationships from the JSON file
    const userRelationships = readUserRelationships();
    console.log('Successfully read user relationships from JSON file');
    
    // Result object to store the findings
    const result = {
      found: false,
      userType: null,
      userInfo: null,
      relatedUsers: [],
      message: null
    };
    
    // Search for the phone number in all SS users' related users
    let foundUser = null;
    let foundSSName = null;
    let isSSUser = false;
    
    // First check if it's an SS user
    for (const ssName in userRelationships) {
      const ssData = userRelationships[ssName];
      if (ssData.PhoneNumber === phoneNumber) {
        foundUser = ssData;
        foundSSName = ssName;
        isSSUser = true;
        break;
      }
    }
    
    // If not an SS user, search in all SS users' related users
    if (!foundUser) {
      for (const ssName in userRelationships) {
        const ssData = userRelationships[ssName];
        
        if (ssData.relatedUsers && ssData.relatedUsers.length > 0) {
          const relatedUsersMap = ssData.relatedUsers[0];
          
          // Check if the phone number exists in this SS's related users
          if (relatedUsersMap[phoneNumber]) {
            foundUser = relatedUsersMap[phoneNumber];
            foundSSName = ssName;
            isSSUser = false;
            break;
          }
        }
      }
    }
    
    // If we still haven't found the user, return not found
    if (!foundUser) {
      console.log(`Phone number ${phoneNumber} not found in any relationships`);
      result.message = 'Phone number not found in any relationships';
      return result;
    }
    
    // If we found the user, determine their type and find all related users
    if (isSSUser) {
      console.log(`Phone number ${phoneNumber} found as SS user`);
      result.found = true;
      result.userType = 'SS';
      result.userInfo = {
        Name: foundUser.Name,
        userName: foundUser.userName,
        PhoneNumber: foundUser.PhoneNumber,
        Designation: 'SS'
      };
      
      // Get all related users for this SS
      if (foundUser.relatedUsers && foundUser.relatedUsers.length > 0) {
        const relatedUsersMap = foundUser.relatedUsers[0];
        
        // Filter to include only Sales Managers, exclude POS users
        result.relatedUsers = Object.keys(relatedUsersMap)
          .filter(phone => {
            const userData = relatedUsersMap[phone];
            // Only include Sales Managers
            return userData[2] === 'Sales Manager' || userData[2] === 'Sales Manager ';
          })
          .map(phone => {
            const userData = relatedUsersMap[phone];
            return {
              phoneNumber: phone,
              username: userData[0],
              name: userData[1],
              designation: userData[2]
            };
          });
        
        console.log(`Found ${result.relatedUsers.length} related Sales Managers for SS ${phoneNumber}`);
      }
    } else {
      console.log(`Phone number ${phoneNumber} found in related users of SS ${foundSSName}`);
      result.found = true;
      
      const userData = foundUser;
      result.userType = userData[2]; // Designation is at index 2
      result.userInfo = {
        phoneNumber: phoneNumber,
        username: userData[0],
        name: userData[1],
        designation: userData[2]
      };
      
      // If this user is a Sales Manager, they should only see SS users
      if (userData[2] === 'Sales Manager' || userData[2] === 'Sales Manager ') {
        console.log(`User is a Sales Manager, adding SS users only...`);
        
        // Add all SS users as related users
        for (const ssName in userRelationships) {
          const ssData = userRelationships[ssName];
          result.relatedUsers.push({
            phoneNumber: ssData.PhoneNumber,
            username: ssData.userName,
            name: ssData.Name,
            designation: 'SS'
          });
        }
      }
      // If this user is a POS, they should see their Sales Manager and SS
      else if (userData[2] === 'POS' || userData[2] === 'POS Referrel') {
        console.log(`User is a POS, finding their Sales Manager and SS...`);
        
        // Get the SS data
        const ssData = userRelationships[foundSSName];
        
        // Add the SS as a related user
        result.relatedUsers.push({
          phoneNumber: ssData.PhoneNumber,
          username: ssData.userName,
          name: ssData.Name,
          designation: 'SS'
        });
        
        // Get the related users map for this SS
        const relatedUsersMap = ssData.relatedUsers[0];
        
        // Find the Sales Manager for this POS
        for (const phone in relatedUsersMap) {
          const managerData = relatedUsersMap[phone];
          if (
            (managerData[2] === 'Sales Manager' || managerData[2] === 'Sales Manager ') &&
            managerData.length > 3 &&
            managerData[3].relatedPOS &&
            managerData[3].relatedPOS.includes(phoneNumber)
          ) {
            result.relatedUsers.push({
              phoneNumber: phone,
              username: managerData[0],
              name: managerData[1],
              designation: managerData[2]
            });
            break;
          }
        }
      }
      
      console.log(`Found ${result.relatedUsers.length} related users for ${phoneNumber}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`Error finding related users for phone number ${phoneNumber}:`, error);
    return {
      found: false,
      message: 'Error finding related users',
      error: error.message
    };
  }
};

/**
 * Controller function to handle Express requests for finding related users
 */
exports.findRelatedUsersController = async (req, res) => {
  try {
    // Support both GET and POST requests
    const phoneNumber = req.query.phoneNumber || req.body.phoneNumber;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    console.log(`Received request to find relations for phone number: ${phoneNumber}`);
    
    // Call our findRelatedUsers function
    const result = await exports.findRelatedUsers(phoneNumber);
    
    if (result.found) {
      // Get complete data for all related users from the database
      const phoneNumbers = result.relatedUsers.map(user => user.phoneNumber).filter(p => p);
      const completeUsers = await PoSP.find({
        PhoneNumber: { $in: phoneNumbers }
      }).select('Name username PhoneNumber Designation');
      
      // Create a map for quick lookup
      const userMap = {};
      completeUsers.forEach(user => {
        userMap[user.PhoneNumber] = user;
      });
      
      // Update related users with complete data
      const relatedUsersWithCompleteData = result.relatedUsers.map(user => {
        const completeData = userMap[user.phoneNumber];
        if (completeData) {
          return {
            ...user,
            ...completeData.toObject ? completeData.toObject() : completeData
          };
        }
        return user;
      });
      
      return res.status(200).json({
        success: true,
        data: {
          ...result,
          relatedUsers: relatedUsersWithCompleteData
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message || 'User not found'
      });
    }
  } catch (error) {
    console.error('Error in findRelatedUsersController:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Modified getRelatedUsers function to use the pre-built JSON structure
 */
exports.getRelatedUsers = async (req, res) => {
  try {
    // Support both GET and POST requests
    const phoneNumber = req.query.phoneNumber || req.body.phoneNumber;
  
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
  
    // Find the requesting user
    const requestingUser = await PoSP.findOne({ PhoneNumber: phoneNumber });
  
    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  
    let relatedUsers = [];
  
    // Based on designation, filter and return appropriate users
    switch (requestingUser.Designation) {
      case 'Sales Manager':
      case 'Sales Manager ': // Note: handling the extra space
        // Sales Manager can only see SS users
        relatedUsers = await PoSP.find({
          Designation: 'SS'
        }).select('Name username PhoneNumber Designation');
        break;
      
      case 'POS':
      case 'POS Referrel':
        // POS can see their Sales Manager and SS users
        // Get the sales manager for this POS user (via crm_id)
        if (requestingUser.crm_id) {
          const salesManager = await PoSP.findOne({
            username: requestingUser.crm_id
          }).select('Name username PhoneNumber Designation');
        
          if (salesManager) {
            relatedUsers.push(salesManager);
          }
        }
        
        // Add all SS users
        const ssUsers = await PoSP.find({
          Designation: 'SS'
        }).select('Name username PhoneNumber Designation');
        
        relatedUsers = relatedUsers.concat(ssUsers);
        break;
      
      case 'SS':
        // For SS users, use the pre-built JSON structure but filter out POS users
        const userRelationships = readUserRelationships();
        const ssData = userRelationships[requestingUser.Name];
        
        if (ssData && ssData.relatedUsers && ssData.relatedUsers.length > 0) {
          const relatedUsersMap = ssData.relatedUsers[0];
          
          // Get phone numbers of all Sales Managers (filtering out POS users)
          const salesManagerPhones = Object.keys(relatedUsersMap).filter(phone => {
            const userData = relatedUsersMap[phone];
            return userData[2] === 'Sales Manager' || userData[2] === 'Sales Manager ';
          });
          
          // Fetch complete data for all Sales Managers
          relatedUsers = await PoSP.find({
            PhoneNumber: { $in: salesManagerPhones }
          }).select('Name username PhoneNumber Designation');
        }
        break;
      
      case 'IT':
        // IT can see all users (if needed)
        relatedUsers = await PoSP.find({}).select('Name username PhoneNumber Designation');
        break;
      
      default:
        relatedUsers = [];
    }
  
    // Get session status for each user and filter only those with "login" status
    const usersWithStatus = [];
   
    for (const user of relatedUsers) {
      const session = await UserSession.findOne({ phoneNumber: user.PhoneNumber });
     
      // Only include users with "login" status
      if (session && session.status === "login") {
        usersWithStatus.push({
          name: user.Name,
          username: user.username,
          phoneNumber: user.PhoneNumber,
          designation: user.Designation,
          status: session.status
        });
      }
    }
  
    res.status(200).json({
      success: true,
      assignedPoSPs: usersWithStatus, // Use the property name expected by frontend
      user: {
        name: requestingUser.Name,
        username: requestingUser.username,
        designation: requestingUser.Designation
      }
    });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Endpoint to manually trigger the JSON update
 */
exports.updateUserRelationships = async (req, res) => {
  try {
    const result = await buildUserRelationships();
    res.status(200).json({
      success: true,
      message: 'User relationships JSON updated successfully',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user relationships'
    });
  }
};

// Setup cron job to update the JSON file every 1 minute
cron.schedule('* * * * *', async () => {
  console.log('Running scheduled update for user relationships...');
  try {
    await buildUserRelationships();
    console.log('Scheduled update completed successfully');
  } catch (error) {
    console.error('Error during scheduled update:', error);
  }
});

