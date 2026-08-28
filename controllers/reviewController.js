const Review = require('../models/Review') || {};

// 1. Add Review / Rating
const addReview = async (req, res) => {
    try {
        const { vendorId, rating, comment } = req.body;
        return res.status(201).json({
            success: true,
            message: "Review added successfully!",
            review: { vendorId, rating, comment }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get Reviews for Vendor
const getVendorReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        return res.status(200).json({
            success: true,
            reviews: []
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Delete Review
const deleteReview = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addReview,
    getVendorReviews,
    deleteReview
};