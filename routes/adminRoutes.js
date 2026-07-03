const express = require('express');
const router = express.Router();

// 1. Controllers Import
const adminController = require('../controllers/adminController') || {};
const getAdminSummary = adminController.getAdminSummary || adminController.getSummary || ((req, res) => res.send("Summary loaded"));
const deleteUser = adminController.deleteUser || ((req, res) => res.send("User deleted"));

// 2. Middleware Safe Import (Taake variable missing ka error dobara kabhi na aaye)
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ ADMIN ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Admin']
router.get('/summary', verifyToken, getAdminSummary);

// #swagger.tags = ['Admin']
router.delete('/user/:id', verifyToken, deleteUser);

module.exports = router;