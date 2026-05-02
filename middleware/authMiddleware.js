const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Login check karne ke liye middleware
exports.protect = async (req, res, next) => {
    let token;

    // Check karna ke header mein token hai ya nahi
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token ko "Bearer <token>" se alag karna
            token = req.headers.authorization.split(' ')[1];

            // Token verify karna
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // User ka data request mein add karna (password ke baghair)
            req.user = await User.findById(decoded.id).select('-password');
            
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// 2. Admin check karne ke liye middleware
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};