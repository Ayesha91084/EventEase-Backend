const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup Logic
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check karna ke user pehle se to nahi hai
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Password ko encrypt karna
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Naya user banana
        user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        // 4. Token banana (Login automatically after signup)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: user._id, name, email, role } });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};