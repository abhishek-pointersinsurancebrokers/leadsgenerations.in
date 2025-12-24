require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('./src/middleware/cors');
const logger = require('./src/middleware/logger');
const database = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const chatRoutes = require('./src/routes/chat');
const socketHandler = require('./src/socket/socketHandler');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize database connection
database.connect();

// Middleware
app.use(cors);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.raw({ limit: '50mb', type: ['application/octet-stream', 'audio/wav'] }));
app.use(logger);
// Add this middleware before other routes
app.use(compression());

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);

// Initialize socket handler
socketHandler(io);

// Start Server
const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment variables loaded:`);
  console.log(` - MONGODB_URI: ${process.env.MONGODB_URI ? '***configured***' : '***missing***'}`);
  console.log(` - SMS_API_URL: ${process.env.SMS_API_URL ? '***configured***' : '***missing***'}`);
  console.log(` - SMS_TOKEN: ${process.env.SMS_TOKEN ? '***configured***' : '***missing***'}`);
  console.log(` - SMS_USER_ID: ${process.env.SMS_USER_ID ? '***configured***' : '***missing***'}`);
  console.log(`\n⚠️ WARNING: OTPs are being logged in clear text for debugging purposes\n`);
});