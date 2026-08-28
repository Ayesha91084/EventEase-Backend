const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Transporter Setup for Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || "fyp20222026@gmail.com",
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 1. SIGNUP API (For Public Customers/Vendors)
// ==========================================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, city, address, description, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        let user = await User.findOne({ email });

        if (user && user.isVerified) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        let assignedRole = role === 'vendor' ? 'vendor' : 'customer';
        
        // Strict Security: Public Signup se koi bhi Admin nahi ban sakta
        if (role === 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Security Alert: Admin role cannot be created via public signup." 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        if (!user) {
            user = new User({
                name,
                email,
                password: hashedPassword,
                role: assignedRole,
                phone: phone || '',
                city,
                address,
                description,
                isVerified: false,
                otp,
                otpExpires
            });
        } else {
            user.name = name;
            user.password = hashedPassword;
            user.role = assignedRole;
            user.otp = otp;
            user.otpExpires = otpExpires;
        }

        await user.save();

        try {
            await transporter.sendMail({
                from: `"EventEase" <${process.env.EMAIL_USER || "fyp20222026@gmail.com"}>`,
                to: email,
                subject: 'EventEase - Account Verification OTP',
                html: `<h3>Your OTP code is: <b>${otp}</b></h3>`
            });
        } catch (mailErr) {
            console.error("Nodemailer Mail Error:", mailErr.message);
        }

        return res.status(201).json({ 
            success: true,
            message: "Signup successful! OTP code has been sent to your email.",
            email: user.email
        });

    } catch (err) {
        return res.status(500).json({ message: "Server Error during registration", error: err.message });
    }
};

// ==========================================
// 2. VERIFY OTP API
// ==========================================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        if (user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP code." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey', 
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully!",
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
        return res.status(500).json({ message: "Verification Error", error: err.message });
    }
};

// ==========================================
// 3. SECURE LOGIN API (DB Bcrypt Verification)
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Database mein email search karo
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 2. Verified check (Admins are pre-verified)
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({ 
                message: "Email is not verified. Please verify your OTP first." 
            });
        }

        // 3. Database Hashed Password Comparison (Bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 4. JWT Token Generation
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretKey', 
            { expiresIn: '7d' }
        );

        return res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ==========================================
// 4. CREATE NEW SUB-ADMIN API (Only Main Admin Can Call)
// ==========================================
exports.createSubAdmin = async (req, res) => {
    try {
        // Sirf main logged in Admin hi access kar sake
        const requestingAdmin = await User.findById(req.user.id);
        if (!requestingAdmin || requestingAdmin.role !== 'admin') {
            return res.status(403).json({ message: "Access Denied: Only Super Admin can create new admin accounts." });
        }

        const { name, email, password, phone } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            phone: phone || '',
            isVerified: true
        });

        await newAdmin.save();

        return res.status(201).json({
            success: true,
            message: "New Sub-Admin account created successfully!",
            admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role }
        });

    } catch (err) {
        return res.status(500).json({ message: "Error creating admin account", error: err.message });
    }
};

// ==========================================
// 5. UPDATE PROFILE
// ==========================================
exports.updateProfile = async (req, res) => {
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

// ==========================================
// 6. FORGOT & RESET PASSWORD
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Please provide an email address." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email." });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            await transporter.sendMail({
                from: `"EventEase Support" <${process.env.EMAIL_USER || "fyp20222026@gmail.com"}>`,
                to: email,
                subject: 'EventEase - Password Reset OTP',
                html: `<h3>Password Reset Code: <b>${otp}</b></h3>`
            });
        } catch (mErr) {
            console.error("Mail Send Error:", mErr.message);
        }

        res.status(200).json({ success: true, message: "Password reset OTP sent to your email." });

    } catch (err) {
        res.status(500).json({ message: "Server error sending reset OTP", error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during password reset" });
    }
};

// ==========================================
// 7. GOOGLE AUTHENTICATION
// ==========================================
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "441112021745-gjvon0valn6vmalq9872u497rqi0npoa.apps.googleusercontent.com";
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

exports.googleAuth = async (req, res) => {
    try {
        const token = req.body.token || req.body.credential;
        const selectedRole = req.body.role;

        if (!token) return res.status(400).json({ success: false, message: "Token missing" });

        let email, name, googleId;
        try {
            const ticket = await googleOAuthClient.verifyIdToken({ idToken: token, audience: CLIENT_ID });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
        } catch (verifyError) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
            email = payload.email;
            name = payload.name;
            googleId = payload.sub;
        }

        if (!email) return res.status(400).json({ success: false, message: "Invalid email in token" });

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
        return res.status(400).json({ success: false, message: "Google Auth Failed", error: err.message });
    }
};

exports.googleLogin = exports.googleAuth;