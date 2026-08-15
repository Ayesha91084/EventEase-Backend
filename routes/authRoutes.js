const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { googleLogin } = require('../controllers/authController');

// Route add karein
router.post('/google', googleLogin);

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOTP);

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);



module.exports = router;