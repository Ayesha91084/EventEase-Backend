const express = require('express');
const router = express.Router();

// 1. Controllers Import
const {
    getAllUsers,
    deleteUser,
    getDashboardStats,
    getDashboardSummary,
    getPendingVendors,
    verifyVendor
} = require('../controllers/adminController');

// 2. Middleware Imports (Authentication & Authorization)
const { protect, admin } = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ ADMIN ROUTES (PROTECTED BY AUTH + ADMIN ROLE)
// ==========================================

// User Management Routes
router.get('/users', protect, admin, getAllUsers);
router.delete('/user/:id', protect, admin, deleteUser);

// Dashboard Analytics Routes
router.get('/stats', protect, admin, getDashboardStats);
router.get('/summary', protect, admin, getDashboardSummary);

// 🚀 Vendor Verification Panel Routes
router.get('/pending', protect, admin, getPendingVendors);
router.patch('/:id/verify', protect, admin, verifyVendor); // Standard PATCH for status updates

module.exports = router;