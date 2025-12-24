const mongoose = require('mongoose');

const pospSchema = new mongoose.Schema({
  _id: String,
  Name: String,
  username: String,
  email: String,
  PhoneNumber: String,
  Designation: String,
  Branch: String,
  'Registration Date': String,
  ss_id: String,
  crm_id: String,
  manager: {
    name: String,
    username: String
  },
  assignedPoSP: [String]
}, {
  collection: 'PoSP',
  strict: false
});

const PoSP = mongoose.model('PoSP', pospSchema);

module.exports = PoSP;