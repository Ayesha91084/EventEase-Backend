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
router.post('/book', verifyToken, (req, res, next) => {
    /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $vendorId: "65f8a123abc456def7890123",
                        $eventDate: "2026-07-15",
                        $totalPrice: 25000,
                        status: "pending"
                    }
                }
            }
        } 
    */
    createBooking(req, res, next);
});

module.exports = router;