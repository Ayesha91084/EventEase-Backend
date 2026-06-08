const Booking = require('../models/Booking'); // Tumhara existing Booking model

// @desc    Create a new booking with date conflict check
// @route   POST /api/bookings/book
// @access  Private (Customer Only)
const createBooking = async (req, res) => {
    try {
        // TERMINAL CHECK: Yeh line debug karne me help karegi
        console.log("Postman se aya hua data:", req.body);

        const { serviceId, vendorId, eventDate, totalAmount } = req.body;
        const customerId = req.user ? req.user.id : null; // authMiddleware se login user ki ID

        // Agar user login nahi hai ya token ka masla hai
        if (!customerId) {
            return res.status(401).json({ success: false, message: "User authentication failed. Token missing or invalid." });
        }

        // Tasalli se check karo ke koi field khali to nahi reh gayi
        if (!serviceId || !vendorId || !eventDate || !totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all required fields.",
                receivedFields: { serviceId, vendorId, eventDate, totalAmount } // Yeh bataye ga konsi field missing mili
            });
        }

        // 1. Check karo ke is date par pehle se koi confirmed ya pending booking hai ya nahi
        const existingBooking = await Booking.findOne({
            serviceId,
            eventDate: new Date(eventDate),
            status: { $in: ['pending', 'confirmed'] } // Lowercase strings check
        });

        // 2. Agar double-booking ho rhi ho to rok do
        if (existingBooking) {
            return res.status(400).json({ 
                success: false, 
                message: "This date is already booked or has a pending payment for this service." 
            });
        }

        // 3. Database me booking create karo
        const newBooking = await Booking.create({
            customerId: customerId,
            vendorId: vendorId,
            serviceId: serviceId,
            eventDate: new Date(eventDate),
            totalAmount: Number(totalAmount), // Number me convert kar dia safely
            status: 'pending',
            paymentStatus: 'pending'
        });

        // 4. Success Response
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