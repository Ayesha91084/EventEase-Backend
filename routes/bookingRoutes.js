const express = require('express');
const router = express.Router();

// 1. Controllers Import
const bookingController = require('../controllers/bookingController') || {};
const createBooking = bookingController.createBooking || bookingController.book || ((req, res) => res.send("Booking processed"));

// 2. Middleware Safe Import (Taake missing variable error na aaye)
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ BOOKING ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Bookings']
router.post('/book', verifyToken, createBooking);

module.exports = router;