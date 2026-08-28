const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const VendorProfile = require('../models/VendorProfile');

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
// 🚀 FIXED: GET ALL PENDING VENDORS (Populates User + Vendor Documents)
// ===================================================================
const getPendingVendors = async (req, res) => {
    try {
        const pendingProfiles = await VendorProfile.find({ isVerified: false })
            .populate('userId', 'name email role isVerified');

        const pendingUsers = await User.find({ role: 'vendor', isVerified: false }).select('-password');

        res.status(200).json({ 
            success: true, 
            count: pendingProfiles.length,
            users: pendingUsers,
            profiles: pendingProfiles
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ===================================================================
// 🚀 APPROVE OR REJECT VENDOR PROFILES (Dual Table Sync)
// ===================================================================
const verifyVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting 'approved' or 'rejected'

        const isApproved = status === 'approved';

        // 1. User Account Verification Update
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isVerified: isApproved },
            { new: true }
        ).select('-password');

        // 2. Vendor Profile Sync
        const updatedProfile = await VendorProfile.findOneAndUpdate(
            { $or: [{ userId: id }, { _id: id }] },
            { isVerified: isApproved, status: isApproved ? 'approved' : 'rejected' },
            { new: true }
        );

        if (!updatedUser && !updatedProfile) {
            return res.status(404).json({ success: false, message: "Vendor profile/user record not found." });
        }

        res.status(200).json({ 
            success: true, 
            message: `Vendor verified flag toggled to ${status}`, 
            user: updatedUser,
            profile: updatedProfile
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Single module exports
module.exports = { 
    getAllUsers, 
    deleteUser, 
    getDashboardStats, 
    getDashboardSummary,
    getPendingVendors,
    verifyVendor
};