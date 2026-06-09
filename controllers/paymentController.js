const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// @desc    Process Payment using Stripe Sandbox
// @route   POST /api/payments/charge
const processPayment = async (req, res) => {
    try {
        const { bookingId, token } = req.body;

        if (!bookingId || !token) {
            return res.status(400).json({ success: false, message: "Booking ID and Payment Token are required." });
        }

        // 1. Stripe Sandbox Charge Create karein
        const charge = await stripe.charges.create({
            amount: 50000 * 100, // Cents me amount (e.g., 50000 PKR)
            currency: 'pkr',
            source: token, // Postman se 'tok_visa' bhejein ge
            description: `Payment for EventEase Booking ID: ${bookingId}`,
        });

        // 2. Database me Booking status update karein
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'confirmed', paymentStatus: 'paid' },
            { new: true } // Taake updated record wapas mile
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking ID not found in database." });
        }

        return res.status(200).json({
            success: true,
            message: "Payment Processed Successfully via Stripe Sandbox! Booking Confirmed.",
            chargeId: charge.id,
            bookingStatus: updatedBooking.status,
            paymentStatus: updatedBooking.paymentStatus
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment };