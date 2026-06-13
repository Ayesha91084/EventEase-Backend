const express = require('express');
const router = express.Router();
const { giveRating } = require('../controllers/ratingController');

// Bina token ke direct testing ke liye setup kiya hai
router.post('/give-rating', giveRating);

module.exports = router;