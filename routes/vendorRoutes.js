const express = require('express');
const router = express.Router();

// 1. Multer Middleware (Cloudinary Memory Storage Buffer)
const upload = require('../middleware/multer');

// 2. Controllers Import (Clean Destructuring)
const {
    registerVendor,
    getVendorProfile,
    updateVendorProfile,
    updateVendorLocation,
    searchVendorsByLocation,
    uploadProfilePicture,
    getAllVendors,
    getVendorById,
    uploadPortfolioMedia,
    deletePortfolioMedia,
    getCategories,
    createCategory
} = require('../controllers/vendorController');

// 3. Authentication & Role Authorization Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// #swagger.tags = ['Vendors']

// ==========================================
// 🏷️ CATEGORY MANAGEMENT ROUTES
// ==========================================

// Public Route: Get All Active Categories
router.get('/categories', getCategories);

// Route to Add New Category via Postman
router.post('/categories', createCategory);

// ==========================================
// 🌐 PUBLIC VENDOR SEARCH & DISCOVERY ROUTES
// ==========================================

// 1. Public Search Vendors (By OpenStreetMap Coordinates, City, or Name)
router.get('/search', searchVendorsByLocation);

// 2. Public Route: Get All Verified Vendors (For Landing/Directory Page)
router.get('/', getAllVendors);

// ==========================================
// 🔐 PROTECTED VENDOR PROFILE ROUTES (NEW ADDITION)
// ==========================================

// Get Current Logged-in Vendor Profile (/api/vendors/me)
router.get('/me', protect, getVendorProfile);

// Dynamic Profile Fallback Fetch (/api/vendors/user/:userId)
router.get('/user/:userId', getVendorProfile);

// Update Vendor Profile Info (/api/vendors/profile)
router.put('/profile', protect, updateVendorProfile);

// ==========================================
// 🔐 PROTECTED VENDOR MANAGEMENT ROUTES
// ==========================================

// Vendor Onboarding: Register Profile & Upload Verification CNIC/Documents (Max 5 files)
router.post('/register', protect, upload.array('documents', 5), registerVendor);

// OpenStreetMap Location Update (Coordinates Sync)
router.put('/update-location', protect, authorize('vendor'), updateVendorLocation);

// Vendor Profile Picture Upload (Cloudinary Single File Upload)
router.put('/profile/upload-image', protect, authorize('vendor'), upload.single('profilePicture'), uploadProfilePicture);

// Vendor Portfolio Media Upload (Max 5 images, Max 3 videos)
router.post('/:vendorId/portfolio', protect, authorize('vendor'), upload.array('media', 8), uploadPortfolioMedia);

// Vendor Portfolio Media Delete (Delete image/video from portfolio)
router.delete('/:vendorId/portfolio', protect, authorize('vendor'), deletePortfolioMedia);

// Public Route: Get Single Vendor Details by ID (Must be below /me, /user, /search)
router.get('/:id', getVendorById);

module.exports = router;