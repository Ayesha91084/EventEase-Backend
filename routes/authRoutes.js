const express = require('express');
const router = express.Router();

// Direct destructuring 
const { 
  signup, 
  login, 
  verifyOTP, 
  googleAuth, 
  forgotPassword, 
  resetPassword, 
  getMe, 
  updateProfile 
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ AUTHENTICATION & SOCIAL LOGIN ROUTES
// ==========================================

// Standard Manual Auth
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);

// Google OAuth Login
router.post('/google', googleAuth);

// Password Management Workflow
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ==========================================
// 🔐 PROTECTED USER PROFILE ROUTES
// ==========================================

// Get Current Logged-in User Profile
router.get('/me', protect, getMe);

// Update Profile Details
router.put('/profile/update', protect, updateProfile);

module.exports = router;