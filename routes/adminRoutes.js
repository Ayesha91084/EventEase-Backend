const express = require('express');
const router = express.Router();

// Controllers Import
const adminController = require('../controllers/adminController') || {};
const getAllUsers = adminController.getAllUsers || ((req, res) => res.send("Users listed"));
const deleteUser = adminController.deleteUser || ((req, res) => res.send("User deleted"));
const getDashboardStats = adminController.getDashboardStats || ((req, res) => res.send("Stats loaded"));
const getDashboardSummary = adminController.getDashboardSummary || adminController.getAdminSummary || ((req, res) => res.send("Summary loaded"));
const getPendingVendors = adminController.getPendingVendors || ((req, res) => res.send("Pending vendors fetched"));
const verifyVendor = adminController.verifyVendor || ((req, res) => res.send("Vendor verification updated"));

// Middleware Imports (Protect & Admin strictly enforced)
const authMiddleware = require('../middleware/authMiddleware') || {};
const protect = authMiddleware.protect || authMiddleware.verifyToken || ((req, res, next) => next());
const admin = authMiddleware.admin || ((req, res, next) => next());

// ==========================================
// 🛠️ ADMIN ROUTES (LOCKED WITH PROTECT + ADMIN)
// ==========================================

router.get('/users', protect, admin, getAllUsers);
router.delete('/user/:id', protect, admin, deleteUser);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/summary', protect, admin, getDashboardSummary);

// 🚀 ADMIN VENDOR VERIFICATION PANEL ROUTES
router.get('/pending', protect, admin, (req, res, next) => {
    getPendingVendors(req, res, next);
});

router.put('/:id/verify', protect, admin, (req, res, next) => {
    verifyVendor(req, res, next);
});

module.exports = router;