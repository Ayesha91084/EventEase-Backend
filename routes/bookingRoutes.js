const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware'); // Tumhara existing protect middleware

// Route to create booking (Protected)
router.post('/book', protect, createBooking);

module.exports = router;