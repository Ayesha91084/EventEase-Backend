// `.env` file se secret key load ho rhi hai safely
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// @desc    Process Payment using Stripe
// @route   POST /api/payments/charge
const processPayment = async (req, res) => {
    try {
        const { bookingId, token } = req.body; // Postman se bookingId aur token milega

        if (!bookingId || !token) {
            return res.status(400).json({ success: false, message: "Booking ID and Payment Token are required." });
        }

        // 1. Stripe standard charge format (Live/Sandbox structure)
        const charge = await stripe.charges.create({
            amount: 50000 * 100, // Amount ko paisa/cents me convert kia
            currency: 'pkr',
            source: token, // Postman se testing k liye 'tok_visa' bhejein ge
            description: `Payment for EventEase Booking ID: ${bookingId}`,
        });

        // 2. Booking database record ko confirm aur paid mark karo
        await Booking.findByIdAndUpdate(bookingId, {
            status: 'confirmed',
            paymentStatus: 'paid'
        });

        return res.status(200).json({
            success: true,
            message: "Payment Processed Successfully! Booking has been Confirmed.",
            chargeId: charge.id,
            receipt_url: charge.receipt_url
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment };