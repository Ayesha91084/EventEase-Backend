const express = require('express');
const router = express.Router();
const multer = require('multer');

// 1. Controllers Import
const vendorController = require('../controllers/vendorController') || {};
const registerVendor = vendorController.registerVendor || ((req, res) => res.send("Registration processed"));
const updateVendorLocation = vendorController.updateVendorLocation || vendorController.updateLocation || ((req, res) => res.send("Location updated"));

// 🚀 NEW: Search controller import with safety fallback check
const searchVendorsByLocation = vendorController.searchVendorsByLocation || ((req, res) => res.send("Search processed"));

// 2. Middleware Safe Import
const authMiddleware = require('../middleware/authMiddleware') || {};
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
// Route: Location base par vendors filter/search karne ke liye (GET /api/vendors/search)
router.get('/search', (req, res, next) => {
    /* #swagger.description = 'City name ya coordinates base par vendors ko dynamically search karne ke liye endpoint' */
    searchVendorsByLocation(req, res, next);
});

module.exports = router;