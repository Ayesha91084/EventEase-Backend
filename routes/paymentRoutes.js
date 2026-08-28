const express = require('express');
const router = express.Router();

// 1. Controllers Import
const {
    processPayment,
    createPaymentIntent,
    getPaymentHistory
} = require('../controllers/paymentController');

// 2. Auth Middleware Import
const authMiddleware = require('../middleware/authMiddleware');

// Fallback protection: check if protect function exists, else pass dummy middleware
const protect = authMiddleware && authMiddleware.protect 
    ? authMiddleware.protect 
    : (req, res, next) => next();

// ==========================================
// 💳 PAYMENT ROUTES
// ==========================================

// Process Direct Charge & Commission Deduction
router.post('/charge', protect, processPayment);

// Create Payment Intent
router.post('/create-intent', protect, createPaymentIntent);

// Get Customer Payment History
router.get('/history', protect, getPaymentHistory);

module.exports = router;