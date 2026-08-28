const express = require('express');
const router = express.Router();

// 1. Direct Controllers Import
const { 
    createNotification, 
    getUserNotifications, 
    markAsRead, 
    sendEmailNotification 
} = require('../controllers/notificationController');

// 2. Auth Middleware Import (Security Layer)
const { protect } = require('../middleware/authMiddleware');

// #swagger.tags = ['Notifications']

// ==========================================
// 🛠️ NOTIFICATION ROUTES DEFINITION
// ==========================================

// 1. Logged-in User ke In-App Notifications fetch karna
router.get('/my-notifications', protect, getUserNotifications);

// 2. Admin ya System Services ke through Notification DB mein save karna
router.post('/create', protect, createNotification);

// 3. Email Notification Dispatch API
router.post('/send-email', protect, sendEmailNotification);

// 4. Mark Single Notification as Read (Red Badge Clear karne ke liye)
router.patch('/:id/read', protect, markAsRead);

module.exports = router;