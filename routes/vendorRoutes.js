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
    getVendorById,
    uploadPortfolioMedia,
    deletePortfolioMedia,
    getCategories,
    createCategory
} = require('../controllers/vendorController');

const { protect } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/search', searchVendorsByLocation);
router.get('/', getAllVendors);

router.get('/me', protect, getVendorProfile);
router.get('/user/:userId', getVendorProfile);
router.put('/profile', protect, updateVendorProfile);

router.post('/register', protect, upload.array('documents', 5), registerVendor);
router.put('/update-location', protect, updateVendorLocation);

router.put('/profile/upload-image/:vendorId', protect, upload.single('profilePicture'), uploadProfilePicture);
router.post('/:vendorId/portfolio', protect, upload.array('media', 8), uploadPortfolioMedia);
router.delete('/:vendorId/portfolio', protect, deletePortfolioMedia);

router.get('/:id', getVendorById);

module.exports = router;