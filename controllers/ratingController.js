const Rating = require('../models/Rating');
const VendorProfile = require('../models/VendorProfile');

// ==========================================
// 1. GIVE / UPDATE RATING API
// ==========================================
// @route   POST /api/ratings/give
// @access  Private (Customer Only)
const giveRating = async (req, res) => {
    try {
        const { vendorId, stars, review } = req.body;

        // Customer ID JWT middleware se fetch karein
        const customerId = req.user ? (req.user.id || req.user._id) : req.body.customerId;

        // 1. Basic Validation
        if (!vendorId || !customerId || !stars) {
            return res.status(400).json({ 
                success: false, 
                message: "Vendor ID, Customer ID, and Stars rating are required." 
            });
        }

        const ratingNum = Number(stars);
        if (ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Rating must be between 1 and 5 stars." 
            });
        }

        // 2. Prevent Duplicate Rating / Update existing one
        let existingRating = await Rating.findOne({ vendor: vendorId, customer: customerId });

        if (existingRating) {
            existingRating.stars = ratingNum;
            if (review) existingRating.review = review;
            await existingRating.save();
        } else {
            existingRating = new Rating({
                vendor: vendorId,
                customer: customerId,
                stars: ratingNum,
                review: review || ''
            });
            await existingRating.save();
        }

        // 3. Recalculate Average Rating for Vendor Profile
        const allRatings = await Rating.find({ vendor: vendorId });
        const avgRating = allRatings.reduce((sum, item) => sum + item.stars, 0) / allRatings.length;

        // VendorProfile Database mein live score update karein
        await VendorProfile.findOneAndUpdate(
            { $or: [{ _id: vendorId }, { userId: vendorId }] },
            { 
                rating: avgRating.toFixed(1),
                totalReviews: allRatings.length 
            }
        );

        return res.status(201).json({
            success: true,
            message: "Rating submitted successfully!",
            data: existingRating,
            vendorAverage: avgRating.toFixed(1)
        });

    } catch (error) {
        console.error("Rating Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 2. GET VENDOR RATINGS & REVIEWS
// ==========================================
const getVendorRatings = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const ratings = await Rating.find({ vendor: vendorId })
            .populate('customer', 'name profileImage')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { giveRating, getVendorRatings };