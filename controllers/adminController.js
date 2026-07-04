const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Vendor = require('../models/VendorProfile'); // Added for profile query

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
};

// Admin can delete a user
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Error deleting user" });
    }
};

// System ki summary
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalServices = await Service.countDocuments();
        res.status(200).json({
            users: totalUsers,
            bookings: totalBookings,
            services: totalServices,
            msg: "Admin dashboard stats fetched successfully"
        });
    } catch (error) {
        res.status(500).json({ msg: "Error fetching stats", error: error.message });
    }
};

// Detailed Summary API
const getDashboardSummary = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const verifiedVendors = await User.countDocuments({ role: 'vendor', isVerified: true });
        res.status(200).json({
            success: true,
            stats: { totalUsers, totalVendors, totalCustomers, verifiedVendors }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dashboard data", error: error.message });
    }
};

// ===================================================================
// 🚀 NEW: GET ALL PENDING VENDORS (For Admin Verification Panel)
// ===================================================================
const getPendingVendors = async (req, res) => {
    try {
        // Main user credentials table se status check query lagayi
        const pendingVendors = await User.find({ role: 'vendor', isVerified: false }).select('-password');
        res.status(200).json({ success: true, data: pendingVendors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================================================================
// 🚀 NEW: APPROVE OR REJECT VENDOR PROFILES (Admin Action Control)
// ===================================================================
const verifyVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting 'approved' or 'rejected'

        const isApproved = status === 'approved';

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isVerified: isApproved },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User profile context not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: `Vendor verified flag toggled to ${status}`, 
            data: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Sab ko ek sath single export me rakhein
module.exports = { 
    getAllUsers, 
    deleteUser, 
    getDashboardStats, 
    getDashboardSummary,
    getPendingVendors,
    verifyVendor
};