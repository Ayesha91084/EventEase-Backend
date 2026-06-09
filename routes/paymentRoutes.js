const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');

router.post('/charge', processPayment);

module.exports = router;