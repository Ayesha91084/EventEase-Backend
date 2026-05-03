const User = require('../models/User');

// Get all users (Customers and Vendors) for Admin Dashboard
const getAllUsers = async (req, res) => {
    try {
        // Hum password field ko exclude kar rahe hain security ke liye
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
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// System ki summary dikhane ke liye
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

// module.exports mein iska naam bhi add kar dena
module.exports = { getAllUsers, deleteUser, getDashboardStats };


module.exports = { getAllUsers, deleteUser };

//const User = require('../models/User');

// Admin Dashboard Summary API
const getDashboardSummary = async (req, res) => {
    try {
        // Alag alag roles ka count nikalna
        const totalUsers = await User.countDocuments();
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const verifiedVendors = await User.countDocuments({ role: 'vendor', isVerified: true });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalVendors,
                totalCustomers,
                verifiedVendors
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dashboard data", error: error.message });
    }
};

module.exports = { getDashboardSummary }; // Isay export lazmi karein