const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dono middleware (protect aur admin) lagana zaroori hain
router.get('/users', protect, admin, getAllUsers);
router.delete('/user/:id', protect, admin, deleteUser);



module.exports = router;
const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard summary sirf login admin dekh sakta hai
router.get('/summary', protect, admin, getDashboardSummary);

module.exports = router;