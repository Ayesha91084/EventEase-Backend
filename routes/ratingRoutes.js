const express = require('express');
const router = express.Router();

// 1. Direct Controllers Import
const { 
    addReview, 
    getVendorReviews, 
    getCustomerReviews 
} = require('../controllers/reviewController');

// 2. Auth Middleware Import
const { protect } = require('../middleware/authMiddleware');

// #swagger.tags = ['Reviews & Ratings']

// ==========================================
// 🛠️ REVIEWS & RATINGS ROUTES DEFINITION
// ==========================================

// 1. Submit New Review & Star Rating (Customer Only)
router.post('/', protect, addReview);

// 2. Fetch all reviews for a specific vendor (Public Page View)
router.get('/vendor/:vendorId', getVendorReviews);

// 3. Fetch reviews submitted by the logged-in customer (Customer Dashboard)
router.get('/my-reviews', protect, getCustomerReviews);

module.exports = router;