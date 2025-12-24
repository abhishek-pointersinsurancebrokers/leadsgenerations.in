//middleware/cors.js

const cors = require('cors');

module.exports = cors({
  origin: "*", // allow all domains 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});