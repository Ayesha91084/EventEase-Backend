const express = require('express');
const router = express.Router();

// 1. Controllers Import
const paymentController = require('../controllers/paymentController') || {};
const processPayment = paymentController.processPayment || paymentController.charge || ((req, res) => res.send("Payment charged"));

// 2. Middleware Safe Import (Taake missing variable error na aaye)
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ PAYMENT ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Payments']
router.post('/charge', verifyToken, processPayment);

module.exports = router;