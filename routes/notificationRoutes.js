const express = require('express');
const router = express.Router();
const { 
    createNotification, 
    getUserNotifications, 
    sendEmailNotification 
} = require('../controllers/notificationController');

// #swagger.tags = ['Notifications']

// DB me Notification Store karne ka endpoint
router.post('/create', createNotification);

// User ki DB wali Notification lene ka endpoint
router.get('/user/:userId', getUserNotifications);

// Email bhejney ka endpoint (Tumhara pehle wala)
router.post('/send-email', sendEmailNotification);

module.exports = router;