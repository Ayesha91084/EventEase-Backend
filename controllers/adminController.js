const User = require('../models/User');
const Vendor = require('../models/VendorProfile');
const Booking = require('../models/Booking');

// 1. Admin Dashboard Stats
const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalBookings = await Booking.countDocuments();

        return res.status(200).json({
            success: true,
            stats: { totalUsers, totalVendors, totalBookings }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        return res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get All Vendors
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('userId', 'name email');
        return res.status(200).json({ success: true, count: vendors.length, vendors });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Approve Vendor
const approveVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByIdAndUpdate(id, { isVerified: true, status: 'approved' }, { new: true });
        return res.status(200).json({ success: true, message: "Vendor approved successfully", vendor });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get All Bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        return res.status(200).json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminDashboard,
    getAllUsers,
    getAllVendors,
    approveVendor,
    getAllBookings
};