const express = require('express');
const router = express.Router();

// 1. Direct Controllers Import
const { 
    createBooking, 
    getVendorBookings, 
    updateBookingStatus, 
    getCustomerBookings,
    getBookingById
} = require('../controllers/bookingController');

// 2. Authentication Middleware Import
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ BOOKING ROUTES DEFINITION
// ==========================================

// 1. Create Booking Route (Customer places a booking request)
// #swagger.tags = ['Bookings']
router.post('/book', protect, createBooking);
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

// ===================================================================
// 🚀 VENDOR & CUSTOMER DASHBOARD INTEGRATION ROUTES
// ===================================================================

// 2. Get Vendor Specific Bookings (Vendor Dashboard)
// #swagger.tags = ['Bookings']
// #swagger.description = 'Vendor dashboard par uski specific bookings load karne ke liye'
router.get('/vendor/:vendorId', protect, getVendorBookings);

// 3. Customer Dashboard Route (Fetch Logged-in Customer Active Bookings)
// #swagger.tags = ['Bookings']
// #swagger.description = 'Customer dashboard par personal active bookings fetch karne ke liye'
router.get('/customer/my-bookings', protect, getCustomerBookings);

// 4. Update Booking Status Route (Vendor Accept/Reject Actions)
// #swagger.tags = ['Bookings']
router.patch('/:id/status', protect, updateBookingStatus);
/* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $status: "accepted"
                }
            }
        }
    } 
*/
// Get single booking by ID
router.get('/:id', protect, getBookingById);

module.exports = router;