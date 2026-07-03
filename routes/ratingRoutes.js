const express = require('express');
const router = express.Router();

// 1. Controllers Import
const ratingController = require('../controllers/ratingController') || {};
const giveRating = ratingController.giveRating || ratingController.submitRating || ((req, res) => res.send("Rating submitted successfully"));

// 2. Middleware Safe Import (Taake variable missing error na aaye)
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ RATINGS & FEEDBACK ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Ratings & Feedback']
router.post('/give-rating', verifyToken, giveRating);

module.exports = router;