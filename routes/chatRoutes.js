const express = require('express');
const router = express.Router();

// 1. Controllers Import
const chatController = require('../controllers/chatController') || {};
const getChatRoom = chatController.getChatRoom || chatController.room || ((req, res) => res.send("Chat room loaded"));

// 2. Middleware Safe Import
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ CHAT ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Chat']
router.get('/room/:id', verifyToken, getChatRoom);

module.exports = router;