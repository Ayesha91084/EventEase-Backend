const express = require('express');
const router = express.Router();

// 1. Controllers Import
const { 
    processPayment, 
    createPaymentIntent, 
    getPaymentHistory,
    verifyPayment
} = require('../controllers/paymentController');

// 2. Auth Middleware Import
const { protect } = require('../middleware/authMiddleware');

// #swagger.tags = ['Payments']

// ==========================================
// 💳 PAYMENT ROUTES DEFINITION
// ==========================================

// 1. Create Payment Intent (Stripe/Payment Gateway Handshake)
router.post('/create-intent', protect, createPaymentIntent);

// 2. Process / Confirm Payment Charge
router.post('/charge', protect, processPayment);

// 3. Verify Transaction Status via Gateway Reference
router.post('/verify', protect, verifyPayment);

// 4. Fetch Logged-in User Transaction History
router.get('/history', protect, getPaymentHistory);

module.exports = router;