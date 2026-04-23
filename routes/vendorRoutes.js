const express = require('express');
const router = express.Router();
const { registerVendor } = require('../controllers/vendorController');
const { storage } = require('../utils/cloudinary'); // Jo file aapne pehle banayi thi
const multer = require('multer');

// Multer ko batana ke Cloudinary storage use kare
const upload = multer({ storage });

// Route: Vendor register kare aur documents upload kare (max 5 files)
// 'documents' wohi naam hona chahiye jo hum Postman ya Frontend mein use karenge
router.post('/register', upload.array('documents', 5), registerVendor);

module.exports = router;