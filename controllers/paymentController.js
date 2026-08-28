const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');
const Booking = require('../models/Booking');

// ==========================================
// 1. PROCESS PAYMENT & PLATFORM COMMISSION (STRIPE)
// ==========================================
// @route   POST /api/payments/charge
// @access  Private (Customer Only)
const processPayment = async (req, res) => {
    try {
        const { bookingId, token, amount } = req.body;

        if (!bookingId || !token) {
            return res.status(400).json({ 
                success: false, 
                message: "Booking ID and Payment Token are required." 
            });
        }

        // Fetch Target Booking Record
        const targetBooking = await Booking.findById(bookingId);
        if (!targetBooking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking ID not found in database." 
            });
        }

        // Prevent Double Payment
        if (targetBooking.paymentStatus === 'paid') {
            return res.status(400).json({ 
                success: false, 
                message: "This booking has already been paid for." 
            });
        }

        const grossAmount = Number(amount || targetBooking.totalAmount || 50000);

        // Modern Stripe PaymentIntent / Charge Creation
        let chargeId;
        try {
            const charge = await stripe.charges.create({
                amount: Math.round(grossAmount * 100), // Cents / Paisa calculation
                currency: 'pkr',
                source: token, // Postman Sandbox: 'tok_visa'
                description: `Payment for EventEase Booking ID: ${bookingId}`,
            });
            chargeId = charge.id;
        } catch (stripeErr) {
            return res.status(400).json({
                success: false,
                message: `Stripe Transaction Failed: ${stripeErr.message}`
            });
        }

        // 10% Platform Commission Calculation
        const rate = targetBooking.commissionRate || 10;
        const calculatedCommission = (grossAmount * rate) / 100;
        const calculatedVendorPayout = grossAmount - calculatedCommission;

        // Financial Audit Update in DB
        targetBooking.status = 'accepted';
        targetBooking.paymentStatus = 'paid';
        targetBooking.paymentIntentId = chargeId;
        targetBooking.adminCommission = calculatedCommission;
        targetBooking.vendorPayout = calculatedVendorPayout;

        await targetBooking.save();

        return res.status(200).json({
            success: true,
            message: "Payment Processed Successfully! Platform Commission Deducted.",
            chargeId: chargeId,
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

// ==========================================
// 2. CREATE PAYMENT INTENT (STRIPE INTEGRATION)
// ==========================================
const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round((amount || 5000) * 100),
            currency: currency || 'pkr',
            payment_method_types: ['card'],
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. GET USER PAYMENT HISTORY
// ==========================================
const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const bookings = await Booking.find({ user: userId, paymentStatus: 'paid' });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            payments: bookings
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    processPayment,
    createPaymentIntent,
    getPaymentHistory
};