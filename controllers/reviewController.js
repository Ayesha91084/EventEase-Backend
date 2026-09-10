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

        // check booking status
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "I didn't get booking." });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ success: false, message: "You can only give a rating after the booking is completed." });
        }

        // only one rating can be given per booking
        const alreadyExists = await Review.findOne({ bookingId });
        if (alreadyExists) {
            return res.status(400).json({ success: false, message: "This booking has already been rated." });
        }

        // save
        const newReview = new Review({ bookingId, customerId, vendorId, rating, comment: comment || "" });
        await newReview.save();

        // Update the vendor's average rating 
        const allReviews = await Review.find({ vendorId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await VendorProfile.findOneAndUpdate(
            { $or: [{ _id: vendorId }, { userId: vendorId }] },
            { rating: avgRating.toFixed(1), totalReviews: allReviews.length }
        );

        return res.status(201).json({ success: true, message: "The rating has been added!", data: newReview });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addReview, getVendorReviews, deleteReview };