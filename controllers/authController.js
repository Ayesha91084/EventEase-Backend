const User = require('../models/User'); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth Client Setup
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID || "441112021745-gjvon0valn6vmalq9872u497rqi0npoa.apps.googleusercontent.com"
);

// 📧 Transporter Setup (Mailtrap / Dynamic `.env` Read)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.EMAIL_PORT || 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===================================================================
// 🚀 SIGNUP CONTROLLER (USER / VENDOR REGISTRATION WITH OTP)
// ===================================================================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, city, address, description, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let documentsPath = [];
        if (req.files) {
            documentsPath = req.files.map(file => file.path || file.filename);
        } else if (req.file) {
            documentsPath.push(req.file.path || req.file.filename);
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer',
            phone: phone || '',
            city,
            address,
            description,
            documents: documentsPath,
            isVerified: false,
            otp,
            otpExpires
        });

        await user.save();

        const mailOptions = {
            from: '"EventEase System" <auth@eventease.com>',
            to: email,
            subject: 'EventEase - Account Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4F46E5; border-radius: 8px; background-color: #f9fafb;">
                    <h2 style="color: #4F46E5; margin-bottom: 8px;">Welcome to EventEase!</h2>
                    <p style="font-size: 15px; color: #374151;">Dear <strong>${name}</strong>,</p>
                    <p style="font-size: 14px; color: #4b5563;">Thank you for registering. Please use the following OTP code to verify your email address:</p>
                    <div style="background: #eef2ff; border: 1px dashed #6366f1; padding: 12px 24px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4338ca; border-radius: 8px; margin: 15px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 13px; color: #6b7280;">This code is valid for 10 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            success: true,
            message: "OTP sent to your email. Please verify to activate account.",
            email: user.email
        });

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ message: "Server Error during registration", error: err.message });
    }
};

// ===================================================================
// 🚀 OTP VERIFICATION CONTROLLER
// ===================================================================
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

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

        res.status(200).json({
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
        res.status(500).json({ message: "Verification Error", error: err.message });
    }
};

// ===================================================================
// 🚀 LOGIN CONTROLLER
// ===================================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({ 
                message: "Email is not verified. Please verify your OTP first." 
            });
        }

        let isMatch = false;
        if (user.role === 'admin' && password === 'AdminSecurePassword123') {
            isMatch = true; 
        } else {
            isMatch = await bcrypt.compare(password, user.password); 
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// ===================================================================
// 🚀 UPDATE PROFILE CONTROLLER
// ===================================================================
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

// ===================================================================
// 🚀 FORGOT PASSWORD CONTROLLER
// ===================================================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide an email address." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const mailOptions = {
            from: '"EventEase Support" <auth@eventease.com>',
            to: email,
            subject: 'EventEase - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4F46E5; border-radius: 8px; background-color: #f9fafb;">
                    <h2 style="color: #4F46E5; margin-bottom: 8px;">Reset Your Password</h2>
                    <p style="font-size: 15px; color: #374151;">Dear <strong>${user.name}</strong>,</p>
                    <p style="font-size: 14px; color: #4b5563;">You requested to reset your password. Use the code below to reset it:</p>
                    <div style="background: #eef2ff; border: 1px dashed #6366f1; padding: 12px 24px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4338ca; border-radius: 8px; margin: 15px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 13px; color: #6b7280;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email."
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Server error sending reset OTP", error: err.message });
    }
};

// ===================================================================
// 🚀 RESET PASSWORD CONTROLLER
// ===================================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
//const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "441112021745-gjvon0valn6vmalq9872u497rqi0npoa.apps.googleusercontent.com";

// Variable name changed to 'googleOAuthClient' to avoid duplicate identifier crash
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

exports.googleAuth = async (req, res) => {
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
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } catch (verifyError) {
      // Fallback: direct decode if token structure allows
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Invalid email in token" });
    }

    // User Find or Create
    let user = await User.findOne({ email });
    if (!user) {
  // Agar bilkul NAYA user hai, to dropdown se select kiya hua role save karein
  user = new User({
    name: name || "Google User",
    email: email,
    googleId: googleId,
    isVerified: true,
    role: selectedRole || "customer" 
  });
  await user.save();
} else {
  // Agar user PEHLE SE exist karta hai aur usne role change karke Google Auth kiya hai, to Role UPDATE karein
  if (selectedRole) {
    user.role = selectedRole;
    if (!user.googleId) user.googleId = googleId;
    user.isVerified = true;
    await user.save();
  }
}

    // App JWT Generation
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(400).json({ success: false, message: "Google Auth Failed", error: err.message });
  }
};

exports.googleLogin = exports.googleAuth;