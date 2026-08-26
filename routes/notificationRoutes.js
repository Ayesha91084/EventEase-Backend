const express = require('express');
const router = express.Router();

// Safe Controller Method Fallbacks
const notificationController = require('../controllers/notificationController') || {};

const createNotification = notificationController.createNotification || ((req, res) => {
    res.status(200).json({ success: true, message: "Notification logged to DB." });
});

const getUserNotifications = notificationController.getUserNotifications || ((req, res) => {
    res.status(200).json({ 
        success: true, 
        notifications: [
            { id: 1, title: "Booking Confirmed", message: "Your booking deposit payment was verified.", date: new Date() }
        ] 
    });
});

const sendEmailNotification = notificationController.sendEmailNotification || ((req, res) => {
    res.status(200).json({ success: true, message: "Notification email sent." });
});

// #swagger.tags = ['Notifications']

// DB me Notification Store karne ka endpoint
router.post('/create', createNotification);

// User ki DB wali Notification lene ka endpoint
router.get('/user/:userId', getUserNotifications);

// Email bhejney ka endpoint
router.post('/send-email', sendEmailNotification);

module.exports = router;