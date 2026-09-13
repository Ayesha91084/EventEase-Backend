const express = require('express');
const router = express.Router();

// 1. Multer Middleware (Cloudinary Memory Storage Buffer)
const upload = require('../middleware/multer');

// 2. Controllers Import
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

// CATEGORY MANAGEMENT ROUTES
router.get('/categories', getCategories);
router.post('/categories', createCategory);

// PUBLIC VENDOR SEARCH & DISCOVERY ROUTES
router.get('/search', searchVendorsByLocation);
router.get('/', getAllVendors);

// PROTECTED VENDOR PROFILE ROUTES
router.get('/me', protect, getVendorProfile);
router.get('/user/:userId', getVendorProfile);
router.put('/profile', protect, updateVendorProfile);

// PROTECTED VENDOR MANAGEMENT ROUTES
router.post('/register', protect, upload.array('documents', 5), registerVendor);
router.put('/update-location', protect, authorize('vendor'), updateVendorLocation);

// Vendor Profile Picture Upload (Accepts :vendorId in URL)
router.put('/profile/upload-image/:vendorId', protect, authorize('vendor'), upload.single('profilePicture'), uploadProfilePicture);

// Vendor Portfolio Media Upload (Max 5 images, Max 3 videos)
router.post('/:vendorId/portfolio', protect, authorize('vendor'), upload.array('media', 8), uploadPortfolioMedia);

// Vendor Portfolio Media Delete
router.delete('/:vendorId/portfolio', protect, authorize('vendor'), deletePortfolioMedia);

// Public Route: Get Single Vendor Details by ID
router.get('/:id', getVendorById);

module.exports = router;