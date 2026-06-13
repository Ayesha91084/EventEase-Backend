const express = require('express');
const router = express.Router();
const { registerVendor, updateVendorLocation } = require('../controllers/vendorController');
const { storage } = require('../utils/cloudinary'); 
const multer = require('multer');

// Token verify karne ke liye middleware import (Apna sahi file path aur name check kar lena)
const { protect } = require('../middleware/authMiddleware'); 

// Multer ko batana ke Cloudinary storage use kare
const upload = multer({ storage });

// Route: Vendor register kare aur documents upload kare (max 5 files)
router.post('/register', upload.array('documents', 5), registerVendor);

// 👇 NEW ROUTE: OpenStreetMap Coordinates Update Karne Ka Secure Endpoint 👇
router.put('/update-location', updateVendorLocation);

module.exports = router;