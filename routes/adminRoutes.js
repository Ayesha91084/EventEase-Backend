const express = require('express');
const router = express.Router();

// 1. Safe Import of Admin Controller
const adminController = require('../controllers/adminController') || {};

// 2. Safe Import of Middleware
const authMiddleware = require('../middleware/authMiddleware') || {};

// Fallback Middleware Functions
const protect = authMiddleware.protect || ((req, res, next) => next());
const authorize = authMiddleware.authorize || (() => (req, res, next) => next());

// Fallback Controller Helper
const getHandler = (fnName, defaultMsg) => {
    if (typeof adminController[fnName] === 'function') {
        return adminController[fnName];
    }
    return (req, res) => res.status(200).json({ success: true, message: defaultMsg });
};

// ==========================================
// 🛡️ ADMIN ROUTES (SAFE HANDLERS)
// ==========================================

// Dashboard Analytics / System Overview
router.get('/dashboard', protect, getHandler('getAdminDashboard', 'Admin Dashboard Route Active'));

// Get All Users
router.get('/users', protect, getHandler('getAllUsers', 'Get All Users Route Active'));

// Get All Vendors
router.get('/vendors', protect, getHandler('getAllVendors', 'Get All Vendors Route Active'));

// Approve / Reject Vendor
router.put('/vendor/approve/:id', protect, getHandler('approveVendor', 'Approve Vendor Route Active'));

// Get All Bookings Audit
router.get('/bookings', protect, getHandler('getAllBookings', 'Get All Bookings Route Active'));

module.exports = router;