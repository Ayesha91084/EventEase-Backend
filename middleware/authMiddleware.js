const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Token extract karein
            token = req.headers.authorization.split(' ')[1];

            // Token verify karein
            const decoded = jwt.verify(
                token, 
                process.env.JWT_SECRET || 'secretKey'
            );

            // User fetch karke req.user me save karein
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Aage request pass karne ke liye next() call karna zaroori hai
            return next(); 

        } catch (error) {
            console.error('Middleware Auth Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };