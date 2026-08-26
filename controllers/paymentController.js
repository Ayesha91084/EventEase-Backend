const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// @desc    Process Payment using Stripe Sandbox & Platform Commission Deduction
// @route   POST /api/payments/charge
const processPayment = async (req, res) => {
    try {
        const { bookingId, token, amount } = req.body;

        if (!bookingId || !token) {
            return res.status(400).json({ success: false, message: "Booking ID and Payment Token are required." });
        }

        // 1. Fetch Target Booking Record
        const targetBooking = await Booking.findById(bookingId);
        if (!targetBooking) {
            return res.status(404).json({ success: false, message: "Booking ID not found in database." });
        }

        const grossAmount = amount || targetBooking.totalAmount || 50000;

        // 2. Stripe Sandbox Charge Create
        const charge = await stripe.charges.create({
            amount: Math.round(grossAmount * 100), // Cents calculation
            currency: 'pkr',
            source: token, // Postman Sandbox: 'tok_visa'
            description: `Payment for EventEase Booking ID: ${bookingId}`,
        });

        // 3. TASK 6: 10% Platform Commission Math Execution
        const rate = targetBooking.commissionRate || 10;
        const calculatedCommission = (grossAmount * rate) / 100;
        const calculatedVendorPayout = grossAmount - calculatedCommission;

        // 4. Update Booking Document with Financial Audit
        targetBooking.status = 'confirmed';
        targetBooking.paymentStatus = 'paid';
        targetBooking.paymentIntentId = charge.id;
        targetBooking.adminCommission = calculatedCommission;
        targetBooking.vendorPayout = calculatedVendorPayout;

        await targetBooking.save();

        return res.status(200).json({
            success: true,
            message: "Payment Processed Successfully via Stripe Sandbox! Platform Commission Deducted.",
            chargeId: charge.id,
            bookingStatus: targetBooking.status,
            paymentStatus: targetBooking.paymentStatus,
            financialBreakdown: {
                totalPaid: grossAmount,
                adminCommission: calculatedCommission,
                vendorNetPayout: calculatedVendorPayout
            }
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment };