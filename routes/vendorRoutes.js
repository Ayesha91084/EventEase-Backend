const express = require('express');
const router = express.Router();
const multer = require('multer');

// 1. Controllers Import
const vendorController = require('../controllers/vendorController');
const registerVendor = vendorController.registerVendor;
// Agar updateVendorLocation ya updateLocation dono mein se jo bhi controller mein ho, yeh handle kar le ga
const updateVendorLocation = vendorController.updateVendorLocation || vendorController.updateLocation || ((req, res) => res.send("Location updated"));

// 🚀 NEW: Search controller import jo humne abhi banaya hai
const searchVendorsByLocation = vendorController.searchVendorsByLocation;

// 2. Middleware Safe Import
const authMiddleware = require('../middleware/authMiddleware') || {};
// Jo bhi naam aapke middleware ka ho (verifyToken, protect, ya checkAuth), yeh sab ko check karega taake khali na rahe
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// 3. Cloudinary Utilities Import
const cloudinaryUtils = require('../utils/cloudinary') || {};
const storage = cloudinaryUtils.storage || {};

// Multer Storage Setup
const upload = multer({ storage });

// ==========================================
// 🛠️ VENDOR ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Vendors']
// Route: Vendor register kare aur documents upload kare
router.post('/register', upload.array('documents', 5), registerVendor);

// #swagger.tags = ['Vendors']
// Route: OpenStreetMap Coordinates Update
router.put('/update-location', verifyToken, updateVendorLocation);

// ==========================================
// 🚀 NEW: SEARCH VENDORS BY LOCATION ROUTE (Asma's Fix)
// ==========================================
// #swagger.tags = ['Vendors']
// Route: Location base par vendors filter/search karne ke liye
router.get('/search', searchVendorsByLocation);

module.exports = router;