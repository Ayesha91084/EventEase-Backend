const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage Logic: Ye code automatically Cloudinary par folder bana dega
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'EventEase/Vendor_Docs', // Cloudinary par ye path khud ban jaye ga
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Image size control karne ke liye
  },
});

module.exports = { cloudinary, storage };