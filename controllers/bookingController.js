const Booking = require('../models/Booking');

// @desc     Create a new booking
// @route    POST /api/bookings/book
// @access   Private (Customer Only)
const createBooking = async (req, res) => {
    try {
        console.log("Postman se aya hua data:", req.body);

        const { vendorId, eventDate, totalAmount, packageDetails } = req.body;
        
        // Logged-in user ki ID access
        const customerId = req.user ? (req.user.id || req.user._id) : null; 
        
        if (!customerId) {
            return res.status(401).json({ success: false, message: "Unauthorized! Please login first." });
        }

        // Validation check
        if (!vendorId || !eventDate || !totalAmount || !packageDetails) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
                receivedFields: { vendorId, eventDate, totalAmount, packageDetails }
            });
        }

        // ==========================================
        // 🔒 PAST DATES BLOCKING LOGIC (Asma's Task)
        // ==========================================
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const selectedDate = new Date(eventDate);

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Ghalti! Aap gujre hue kal (past date) ki booking nahi kar sakte. Baraye meherbani aane wali koi date select karein."
            });
        }

        // ===================================================================
        // 🔒 NEW: OVERLAPPING BOOKING PROTECTION (Documentation Flow Page 106)
        // ===================================================================
        const existingBooking = await Booking.findOne({
            vendorId: vendorId,
            eventDate: eventDate,
            status: { $in: ['pending', 'accepted'] } 
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Date Unavailable: Yeh vendor is tareekh par pehle se booked hai!"
            });
        }
        // ==========================================

        // Naya booking record create karein
        const newBooking = new Booking({
            customer: customerId,
            vendorId: vendorId,
            packageDetails: packageDetails,
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

// ===================================================================
// 🚀 GET VENDOR SPECIFIC BOOKINGS (For Vendor Dashboard Tab 2 & Earnings)
// ===================================================================
const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.params.vendorId || (req.user ? (req.user.id || req.user._id) : null);
        
        const bookings = await Booking.find({ vendorId: vendorId })
            .populate('customer', 'name email phone profileImage')
            .sort({ createdAt: -1 });

        // Calculate total earnings from accepted bookings
        const totalEarnings = bookings
            .filter(b => b.status === 'accepted' || b.status === 'done')
            .reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            totalEarnings,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================================================================
// 🚀 UPDATE BOOKING STATUS (Vendor Dashboard Accept/Reject Action)
// ===================================================================
const updateBookingStatus = async (req, res) => {
    try {
        const id = req.params.id || req.params.bookingId;
        const { status } = req.body; // 'accepted' ya 'rejected' frontend control panel se

        if (!['accepted', 'rejected', 'done', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking record not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: `Booking status has been updated to ${status} successfully!`, 
            data: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================================================================
// 🚀 TASK 5 NEW: GET CUSTOMER DASHBOARD BOOKINGS (Customer View Only)
// ===================================================================
const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user ? (req.user.id || req.user._id) : req.params.customerId;

        if (!customerId) {
            return res.status(401).json({ success: false, message: "User context not found." });
        }

        const bookings = await Booking.find({ customer: customerId })
            .populate('vendorId', 'businessName category profileImage location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { 
    createBooking, 
    getVendorBookings, 
    updateBookingStatus,
    getCustomerBookings 
};