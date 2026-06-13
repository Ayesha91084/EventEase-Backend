const Rating = require('../models/Rating');

const giveRating = async (req, res) => {
    try {
        const { vendorId, customerId, stars } = req.body;

        // Validation check for 5 stars
        if (!vendorId || !customerId || !stars) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        if (stars < 1 || stars > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars." });
        }

        // Save rating to database
        const newRating = new Rating({
            vendor: vendorId,
            customer: customerId,
            stars: Number(stars)
        });

        await newRating.save();

        res.status(201).json({
            success: true,
            message: "5-Star Rating submitted successfully!",
            data: newRating
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = { giveRating };