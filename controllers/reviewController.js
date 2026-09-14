const Review = require('../models/Review');
const Booking = require('../models/Booking');
const VendorProfile = require('../models/VendorProfile');

const addReview = async (req, res) => {
    try {
        const { bookingId, vendorId, rating, comment } = req.body;
        const customerId = req.user ? (req.user.id || req.user._id) : req.body.customerId;

        if (!bookingId || !vendorId || !rating) {
            return res.status(400).json({ success: false, message: "bookingId, vendorId aur rating zaroori hain." });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking nahi mili." });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: "Booking complete hone ke baad hi review de sakte hain." });
        }

        const alreadyExists = await Review.findOne({ bookingId });
        if (alreadyExists) {
            return res.status(400).json({ success: false, message: "Is booking ka review pehle hi diya ja chuka hai." });
        }

        const newReview = new Review({ bookingId, customerId, vendorId, rating, comment: comment || "" });
        await newReview.save();

        const allReviews = await Review.find({ vendorId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await VendorProfile.findOneAndUpdate(
            { $or: [{ _id: vendorId }, { userId: vendorId }] },
            { rating: avgRating.toFixed(1), totalReviews: allReviews.length }
        );

        return res.status(201).json({ success: true, message: "Rating add ho gayi!", data: newReview });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Missing handlers required for exports:
const getVendorReviews = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const reviews = await Review.find({ vendorId });
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        await Review.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Review delete ho gaya." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addReview, getVendorReviews, deleteReview };