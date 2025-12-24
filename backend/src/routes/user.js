
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Support both GET and POST requests for /user
router.get('/', userController.findRelatedUsersController);
router.post('/', userController.findRelatedUsersController);

module.exports = router;