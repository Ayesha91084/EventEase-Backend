const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==========================================
// 1. LOGIN & JWT PROTECT MIDDLEWARE
// ==========================================
exports.protect = async (req, res, next) => {
    let token;

    // Check authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token string
            token = req.headers.authorization.split(' ')[1];

            // Verify JWT Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

            // Find User & attach to request object (excluding password)
            req.user = await User.findById(decoded.id || decoded._id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User account no longer exists.' });
            }

            return next(); // End execution here
        } catch (error) {
            console.error('JWT Auth Middleware Error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired.' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
    }
};

// ==========================================
// 2. ADMIN ROLE CHECK MIDDLEWARE
// ==========================================
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({ success: false, message: 'Not authorized as an admin access.' });
    }
};