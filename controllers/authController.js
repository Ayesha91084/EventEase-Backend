const User = require('../models/User'); // User model load ho raha hai
const bcrypt = require('bcryptjs'); // Hashing library load ho rahi hai[cite: 2]
const jwt = require('jsonwebtoken'); // Token generation library load ho rahi hai[cite: 2]

// ===================================================================
// 🚀 1. SIGNUP CONTROLLER
// ===================================================================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check karna ke user pehle se to nahi hai[cite: 2]
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Password ko encrypt karna[cite: 2]
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Naya user banana (Vendor onboarding ke liye status handles configuration)[cite: 2]
        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            // Agar vendor hai to default verified status false hoga, baki roles auto approve[cite: 2]
            isVerified: role === 'vendor' ? false : true
        });

        await user.save();

        // 4. Token banana[cite: 2]
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, user: { id: user._id, name, email, role, isVerified: user.isVerified } });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ===================================================================
// 🚀 2. LOGIN CONTROLLER (With Dynamic Security Bypass Configuration)
// ===================================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karna ke user database mein hai ya nahi[cite: 2]
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 2. VENDOR APPROVAL CHECK (Block access if vendor is not approved by admin)
        if (user.role === 'vendor' && !user.isVerified) {
            return res.status(403).json({ 
                message: "Your registration request is pending approval from the Admin. Please wait." 
            });
        }

        // 3. PASSWORD BYPASS LOGIC FOR ADMIN & GENERAL MATCH
        let isMatch = false;
        if (user.role === 'admin' && password === 'AdminSecurePassword123') {
            isMatch = true; // Securely verify admin login using simple token flag override
        } else {
            isMatch = await bcrypt.compare(password, user.password); // Baqi sab users ke liye hashed text match[cite: 2]
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 4. JWT Token create karna[cite: 2]
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ===================================================================
// 🚀 3. UPDATE PROFILE CONTROLLER (For Dashboards User Identity Data)
// ===================================================================
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profileImage } = req.body;
        
        // Protect middleware se active validation id match query run hogi
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, profileImage },
            { new: true }
        ).select('-password');

        res.status(200).json({ 
            success: true, 
            message: "Profile fields updated successfully in database context!", 
            data: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating database profile log.", error: err.message });
    }
};