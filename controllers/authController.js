const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { OAuth2Client } = require('google-auth-library');

// 1. DIRECT SIGNUP API (No OTP required)
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, city, address, description, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        let assignedRole = role === 'vendor' ? 'vendor' : 'customer';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Direct user creation with isVerified = true
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            phone: phone || '',
            city: city || '',
            address: address || '',
            description: description || '',
            isVerified: true
        });

        await user.save();

        // Generate JWT Token for immediate login
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey', 
            { expiresIn: '7d' }
        );

        return res.status(201).json({ 
            success: true,
            message: "Account created successfully!",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                isVerified: user.isVerified 
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Server Error during registration", error: err.message });
    }
};

// 2. SECURE LOGIN API
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey', 
            { expiresIn: '7d' }
        );

        return res.json({ 
            success: true,
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 3. GET LOGGED-IN USER PROFILE (/me)
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching profile", error: err.message });
    }
};

// 4. UPDATE PROFILE
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, phone, profileImage } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, profileImage },
            { new: true }
        ).select('-password');

        res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating profile log.", error: err.message });
    }
};

// 5. GOOGLE AUTHENTICATION
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "441112021745-gjvon0valn6vmalq9872u497rqi0npoa.apps.googleusercontent.com";
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

const googleAuth = async (req, res, next) => {
    try {
        const token = req.body.token || req.body.credential;
        const selectedRole = req.body.role;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token missing" });
        }

        let email, name, googleId;

        try {
            const ticket = await googleOAuthClient.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
        } catch (verifyError) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
                email = payload.email;
                name = payload.name;
                googleId = payload.sub;
            } catch (decodeErr) {
                console.error("Decode Error:", decodeErr.message);
            }
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Invalid Google Token" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: name || "Google User",
                email: email,
                googleId: googleId,
                isVerified: true,
                role: selectedRole === 'admin' ? 'customer' : (selectedRole || "customer")
            });
            await user.save();
        }

        const appToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretKey',
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            token: appToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err.message);
        return res.status(400).json({
            success: false,
            message: "Google Auth Failed",
            error: err.message
        });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    updateProfile,
    googleAuth,
    googleLogin: googleAuth
};