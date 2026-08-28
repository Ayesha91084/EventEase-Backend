const express = require('express');
const router = express.Router();

// 1. Multer Middleware (Cloudinary Memory Storage Buffer)
const upload = require('../middleware/multer');

// 2. Controllers Import (Clean Destructuring)
const {
    registerVendor,
    updateVendorLocation,
    searchVendorsByLocation,
    uploadProfilePicture,
    getAllVendors,
    getVendorById,
    uploadPortfolioMedia
} = require('../controllers/vendorController');

// 3. Authentication & Role Authorization Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// #swagger.tags = ['Vendors']

// ==========================================
// 🌐 PUBLIC VENDOR SEARCH & DISCOVERY ROUTES
// ==========================================

// 1. Public Search Vendors (By OpenStreetMap Coordinates, City, or Name)
router.get('/search', searchVendorsByLocation);

// 2. Public Route: Get All Verified Vendors (For Landing/Directory Page)
router.get('/', getAllVendors);

// 3. Public Route: Get Single Vendor Details by ID
router.get('/:id', getVendorById);

// ==========================================
// 🔐 PROTECTED VENDOR MANAGEMENT ROUTES
// ==========================================

// 4. Vendor Onboarding: Register Profile & Upload Verification CNIC/Documents (Max 5 files)
router.post('/register', protect, upload.array('documents', 5), registerVendor);

// 5. OpenStreetMap Location Update (Coordinates Sync)
router.put('/update-location', protect, authorize('vendor'), updateVendorLocation);

// 6. Vendor Profile Picture Upload (Cloudinary Single File Upload)
router.put('/profile/upload-image', protect, authorize('vendor'), upload.single('profilePicture'), uploadProfilePicture);

// 7. Vendor Portfolio Media Upload (Max 5 images, Max 3 videos)
router.post('/:vendorId/portfolio', protect, authorize('vendor'), upload.array('media', 8), uploadPortfolioMedia);

module.exports = router;