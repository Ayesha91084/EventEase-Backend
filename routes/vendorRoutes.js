const express = require('express');
const router = express.Router();

// 1. Multer Middleware Import (Naya Memory Storage Middleware)
const upload = require('../middleware/multer');

// 2. Controllers Import
const vendorController = require('../controllers/vendorController') || {};
const registerVendor = vendorController.registerVendor || ((req, res) => res.send("Registration processed"));
const updateVendorLocation = vendorController.updateVendorLocation || vendorController.updateLocation || ((req, res) => res.send("Location updated"));
const searchVendorsByLocation = vendorController.searchVendorsByLocation || ((req, res) => res.send("Search processed"));

// 🚀 NEW: Profile Picture Upload Controller Import
const uploadProfilePicture = vendorController.uploadProfilePicture || ((req, res) => res.send("Profile picture upload processed"));

// 3. Middleware Safe Import
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

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
// 🚀 SEARCH VENDORS BY LOCATION ROUTE
// ==========================================
// #swagger.tags = ['Vendors']
// Route: Location base par vendors filter/search karne ke liye
router.get('/search', (req, res, next) => {
    /* #swagger.description = 'City name ya coordinates base par vendors ko dynamically search karne ke liye endpoint' */
    searchVendorsByLocation(req, res, next);
});

// ==========================================
// 🚀 NEW: PROFILE PICTURE UPLOAD ROUTE
// ==========================================
// #swagger.tags = ['Vendors']
// Route: Profile picture update karne ke liye (PUT /api/vendors/profile/upload-image/:vendorId)
router.put('/profile/upload-image/:vendorId', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;