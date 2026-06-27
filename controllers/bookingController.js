const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings/book
// @access  Private (Customer Only)
const createBooking = async (req, res) => {
    try {
        console.log("Postman se aya hua data:", req.body);

        const { serviceId, vendorId, eventDate, totalAmount } = req.body;
        //const customerId = req.user ? req.user.id : null; // authMiddleware se login user ki ID
        if (!customerId) {
    return res.status(401).json({ success: false, message: "Unauthorized! Please login first." });
}

        // Validation check
        if (!serviceId || !vendorId || !eventDate || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
                receivedFields: { serviceId, vendorId, eventDate, totalAmount }
            });
        }

        // Naya booking record create karein
        const newBooking = new Booking({
            customer: customerId,
            vendor: vendorId,
            service: serviceId,
            eventDate,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending'
        });

        const savedBooking = await newBooking.save();

        return res.status(201).json({
            success: true,
            message: "Slot temporary reserved! Please proceed to payment.",
            booking: savedBooking
        });

    } catch (error) {
        console.error("Booking Controller Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Agar koi aur function pehle tha toh export me add rkhna
module.exports = { createBooking };