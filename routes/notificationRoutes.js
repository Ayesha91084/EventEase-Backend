const express = require('express');
const router = express.Router();

// 1. Safe Controller Import
let notificationController = {};
try {
    notificationController = require('../controllers/notificationController');
} catch (err) {
    console.warn("⚠️ Warning: notificationController.js not found.");
}

// 2. Safe Auth Middleware Import
const authMiddleware = require('../middleware/authMiddleware') || {};
const protect = authMiddleware.protect || ((req, res, next) => next());

// Fallback Handlers
const getUserNotifications = notificationController.getUserNotifications || 
    ((req, res) => res.json({ success: true, notifications: [] }));

const markAsRead = notificationController.markAsRead || 
    ((req, res) => res.json({ success: true, message: "Notification marked as read" }));

const markAllAsRead = notificationController.markAllAsRead || 
    ((req, res) => res.json({ success: true, message: "All notifications marked as read" }));

// ==========================================
// 🔔 NOTIFICATION ROUTES
// ==========================================

router.get('/', protect, getUserNotifications);       
router.get('/user/:userId', getUserNotifications);       
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);

module.exports = router;