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

module.exports = { getAllUsers, deleteUser };