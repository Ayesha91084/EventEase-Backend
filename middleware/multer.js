const multer = require('multer');

// Memory Storage setup for Cloudinary buffers
const storage = multer.memoryStorage();

// File filter (Only Allow Images & Videos)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only images and videos are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Limit (Useful for portfolio videos)
    fileFilter: fileFilter
});

module.exports = upload;