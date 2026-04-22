const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP API
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create New User
        user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        // Create JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            "YOUR_SECRET_KEY", // Keep this in .env later
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, user: { id: user._id, name, email, role } });

    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;

// LOGIN API
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // User check karein
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User does not exist" });

        // Password verify karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        // Token create karein
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            "YOUR_SECRET_KEY", 
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });

    } catch (err) {
        res.status(500).send("Server Error");
    }
});