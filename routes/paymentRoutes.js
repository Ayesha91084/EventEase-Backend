const express = require('express');
const router = express.Router();

// 1. Controller Imports (Ensure names match controller exports)
const {
    createPaymentIntent,
    handleWebhook,
    getPaymentHistory
} = require('../controllers/paymentController');

// 2. Middleware Imports
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 💳 PAYMENT ROUTES
// ==========================================

// Create payment intent
router.post('/create-intent', protect, createPaymentIntent);

// Stripe / Payment Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Get user payment history
router.get('/history', protect, getPaymentHistory);

module.exports = router;