const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  updateVendorLocation,
  searchVendorsByLocation,
  uploadProfilePicture,
  getAllVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getVendorById,
  uploadPortfolioMedia,
  deletePortfolioMedia,
  getCategories,
  createCategory
} = require('../controllers/vendorController');

const { protect } = require('../middleware/authMiddleware');

// Public Category & Search Routes
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/search', searchVendorsByLocation);

// Admin & Approval Routes (MUST BE ABOVE /:id)
router.get('/pending', protect, getPendingVendors);
router.put('/approve/:id', protect, approveVendor);
router.put('/reject/:id', protect, rejectVendor);

// Vendor Listing Routes
router.get('/', getAllVendors);
router.get('/me', protect, getVendorProfile);
router.get('/user/:userId', getVendorProfile);

// Vendor Actions & Profile Updates
router.put('/profile', protect, updateVendorProfile);
router.post('/register', protect, upload.array('documents', 5), registerVendor);
router.put('/update-location', protect, updateVendorLocation);

// Portfolio & Image Upload Routes
router.put('/profile/upload-image/:vendorId', protect, upload.single('profilePicture'), uploadProfilePicture);
router.post('/:vendorId/portfolio', protect, upload.array('media', 8), uploadPortfolioMedia);
router.delete('/:vendorId/portfolio', protect, deletePortfolioMedia);

// Single Vendor Details (Keep at bottom)
router.get('/:id', getVendorById);

module.exports = router;