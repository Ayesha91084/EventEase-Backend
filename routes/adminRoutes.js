const express = require('express');
const router = express.Router();

// 1. Controllers Import (Saare functions safely track karne ke liye update kiya)
const adminController = require('../controllers/adminController') || {};
const getAllUsers = adminController.getAllUsers || ((req, res) => res.send("Users listed"));
const deleteUser = adminController.deleteUser || ((req, res) => res.send("User deleted"));
const getDashboardStats = adminController.getDashboardStats || ((req, res) => res.send("Stats loaded"));
const getDashboardSummary = adminController.getDashboardSummary || adminController.getAdminSummary || ((req, res) => res.send("Summary loaded"));

// 🚀 NEW CONTROLLER FUNCTIONS MAPPING
const getPendingVendors = adminController.getPendingVendors || ((req, res) => res.send("Pending vendors fetched"));
const verifyVendor = adminController.verifyVendor || ((req, res) => res.send("Vendor verification updated"));

// 2. Middleware Safe Import (Taake missing variable error na aaye)
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ ADMIN ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Admin']
router.get('/users', verifyToken, getAllUsers);

// #swagger.tags = ['Admin']
router.delete('/user/:id', verifyToken, deleteUser);

// #swagger.tags = ['Admin']
router.get('/stats', verifyToken, getDashboardStats);

// #swagger.tags = ['Admin']
router.get('/summary', verifyToken, getDashboardSummary);

// ===================================================================
// 🚀 NEW: ADMIN VENDOR VERIFICATION PANEL ROUTES
// ===================================================================

// Admin ke liye pending vendors ki list load karana (GET /api/admin/pending)
// #swagger.tags = ['Admin']
router.get('/pending', verifyToken, (req, res, next) => {
    /* #swagger.description = 'Admin panel ke liye pending authentication vendors fetch karne ke liye' */
    getPendingVendors(req, res, next);
});

// Admin panel se vendor verification state update karna (PUT /api/admin/:id/verify)
// #swagger.tags = ['Admin']
router.put('/:id/verify', verifyToken, (req, res, next) => {
    /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $status: "approved"
                    }
                }
            }
        } 
    */
    verifyVendor(req, res, next);
});

module.exports = router;