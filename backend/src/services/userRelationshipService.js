const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const PoSP = require('../models/PoSP');

// Path to store the JSON file
const JSON_FILE_PATH = path.join(__dirname, '../data/userRelationships.json');

// Ensure the data directory exists
const dataDir = path.dirname(JSON_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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

/**
 * Initializes the user relationships service
 * Sets up a cron job to update the JSON file every 6 hours
 */
function initializeUserRelationshipService() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Running scheduled update for user relationships...');
    buildUserRelationships();
  });
  
  console.log('Cron job scheduled to update user relationships every 6 hours');
  
  // Initial build of the user relationships
  buildUserRelationships();
}

module.exports = {
  buildUserRelationships,
  readUserRelationships,
  initializeUserRelationshipService
};