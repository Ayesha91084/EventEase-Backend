const multer = require('multer');

// Memory Storage: File server par save nahi hogi, direct buffer me jayegi
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

module.exports = upload;