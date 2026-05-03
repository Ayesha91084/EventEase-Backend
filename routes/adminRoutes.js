const express = require('express');
const router = express.Router();
//const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { getAllUsers, deleteUser, getDashboardSummary } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
// Dono middleware (protect aur admin) lagana zaroori hain
//router.get('/users', protect, admin, getAllUsers);
router.get('/summary', protect, admin, getDashboardSummary);
router.delete('/user/:id', protect, admin, deleteUser);




module.exports = router;
