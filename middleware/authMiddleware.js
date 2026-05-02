const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};

// Admin check karne ke liye naya function
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: "Access denied. Admins only." });
    }
};

const isVendor = (req, res, next) => {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ msg: "Access denied. Vendors only." });
    }
    next();
};

module.exports = { protect, isAdmin, isVendor };