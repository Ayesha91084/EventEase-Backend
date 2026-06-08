const Booking = require('../models/Booking'); // Tumhara existing Booking model

// @desc    Create a new booking with date conflict check
// @route   POST /api/bookings/book
// @access  Private (Customer Only)
const createBooking = async (req, res) => {
    try {
        console.log("Postman se aya hua data:", req.body);

        const { serviceId, vendorId, eventDate, totalAmount } = req.body;
        const customerId = req.user ? req.user.id : null; // authMiddleware se login user ki ID

        // 1. Authentication check
        if (!customerId) {
            return res.status(401).json({ success: false, message: "User authentication failed. Token missing or invalid." });
        }

        // 2. Validation check (Yahan syntax strict kar diya hai)
        if (!serviceId || !vendorId || !eventDate || !totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all required fields.",
                receivedFields: { serviceId, vendorId, eventDate, totalAmount }
            });
        }

        // 3. Check karo ke is date par pehle se koi confirmed ya pending booking hai ya nahi
        const existingBooking = await Booking.findOne({
            serviceId,
            eventDate: new Date(eventDate),
            status: { $in: ['pending', 'confirmed'] }
        });

        // 4. Agar double-booking ho rhi ho to rok do
        if (existingBooking) {
            return res.status(400).json({ 
                success: false, 
                message: "This date is already booked or has a pending payment for this service." 
            });
        }

        // 5. Database me booking create karo
        const newBooking = await Booking.create({
            customerId,
            vendorId,
            serviceId,
            eventDate: new Date(eventDate),
            totalAmount: Number(totalAmount),
            status: 'pending',
            paymentStatus: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: "Slot temporary reserved! Please proceed to payment.",
            booking: newBooking
        });

    } catch (error) {
        console.error("Booking Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createBooking };