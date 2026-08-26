const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

// POST /api/auth/google
if (authController.googleLogin) {
    router.post('/google', authController.googleLogin);
}

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// POST /api/auth/login
router.post('/login', authController.login);

// Password Management
if (authController.forgotPassword) router.post('/forgot-password', authController.forgotPassword);
if (authController.resetPassword) router.post('/reset-password', authController.resetPassword);

// PUT /api/auth/profile/update
if (authController.updateProfile) router.put('/profile/update', protect, authController.updateProfile); 

module.exports = router;