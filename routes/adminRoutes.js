const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Sabse pehle 'protect' (login check) phir 'isAdmin' (role check)
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/user/:id', protect, isAdmin, deleteUser);

module.exports = router;