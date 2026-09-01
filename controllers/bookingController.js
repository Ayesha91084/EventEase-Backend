const Booking = require('../models/Booking');

// ==========================================
// 1. CREATE BOOKING API (Customer Only)
// ==========================================
const createBooking = async (req, res) => {
    try {
        console.log("Postman / Frontend Data:", req.body);

        const { vendorId, eventDate, totalAmount, packageDetails } = req.body;
        
        // Logged-in user authentication check
        const customerId = req.user ? (req.user.id || req.user._id) : null; 
        
        if (!customerId) {
            return res.status(401).json({ success: false, message: "Unauthorized! Please login first." });
        }

        // Required fields validation
        if (!vendorId || !eventDate || !totalAmount || !packageDetails) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
                receivedFields: { vendorId, eventDate, totalAmount, packageDetails }
            });
        }

        // ------------------------------------------
        // 🔒 1. Past Dates Validation
        // ------------------------------------------
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const selectedDate = new Date(eventDate);
        if (isNaN(selectedDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format provided." });
        }

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: "Ghalti! Aap gujre hue kal (past date) ki booking nahi kar sakte. Baraye meherbani aane wali koi date select karein."
            });
        }

        // ------------------------------------------
        // 🔒 2. Overlapping Booking Protection (Full Day Range Match)
        // ------------------------------------------
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBooking = await Booking.findOne({
            vendorId: vendorId,
            eventDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'accepted'] } 
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Date Unavailable: Yeh vendor is tareekh par pehle se booked hai!"
            });
        }

        // Create new booking record
        const newBooking = new Booking({
            customer: customerId,
            vendorId: vendorId,
            packageDetails: packageDetails,
            eventDate: selectedDate,
            totalAmount: Number(totalAmount),
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

// ==========================================
// 2. GET VENDOR SPECIFIC BOOKINGS & EARNINGS
// ==========================================
const getVendorBookings = async (req, res) => {
    try {
        const vendorId = req.params.vendorId || (req.user ? (req.user.id || req.user._id) : null);
        
        if (!vendorId) {
            return res.status(400).json({ success: false, message: "Vendor ID is missing." });
        }

        const bookings = await Booking.find({ vendorId: vendorId })
            .populate('customer', 'name email phone profileImage')
            .sort({ createdAt: -1 });

        // Calculate total earnings from accepted/completed bookings
        const totalEarnings = bookings
            .filter(b => b.status === 'accepted' || b.status === 'done')
            .reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
        
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

// ==========================================
// 3. UPDATE BOOKING STATUS (Vendor Accept/Reject)
// ==========================================
const updateBookingStatus = async (req, res) => {
    try {
        const id = req.params.id || req.params.bookingId;
        const { status } = req.body; 

        if (!['accepted', 'rejected', 'done', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking record not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: `Booking status has been updated to '${status}' successfully!`, 
            data: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ==========================================
// 4. GET CUSTOMER DASHBOARD BOOKINGS
// ==========================================
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
// 5. GET SINGLE BOOKING BY ID
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone profileImage')
            .populate('vendorId', 'businessName category profileImage location');

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { 
    createBooking, 
    getVendorBookings, 
    updateBookingStatus,
    getCustomerBookings, 
    getBookingById
};