const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Path verified to middlewares

// ==========================================
// 🛠️ AUTHENTICATION & SOCIAL LOGIN ROUTES
// ==========================================

// Standard Manual Auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);

// Google OAuth Login
router.post('/google', authController.googleLogin);

// Password Management Workflow
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ==========================================
// 🔐 PROTECTED USER PROFILE ROUTES
// ==========================================

// Get Current Logged-in User Profile
router.get('/me', protect, authController.getMe);

// Update Profile Details
router.put('/profile/update', protect, authController.updateProfile);

module.exports = router;