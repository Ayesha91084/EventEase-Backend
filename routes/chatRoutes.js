const express = require('express');
const router = express.Router();

// 1. Controllers Import
const chatController = require('../controllers/chatController');
const getChatHistory = chatController.getChatHistory;
const saveMessage = chatController.saveMessage; // Backup save flow shamil kar diya

// 2. Middleware Safe Import
const authMiddleware = require('../middleware/authMiddleware') || {};
const verifyToken = authMiddleware.verifyToken || authMiddleware.protect || authMiddleware.checkAuth || ((req, res, next) => next());

// ==========================================
// 🛠️ CHAT ROUTES DEFINITION
// ==========================================

// #swagger.tags = ['Chat']
// Asma jab frontend se call karegi: /api/chat/room/room_123?page=1&limit=20
router.get('/room/:room', verifyToken, getChatHistory);

// #swagger.tags = ['Chat']
// Message HTTP route se save karne ke liye: POST /api/chat/save
router.post('/save', verifyToken, saveMessage);

module.exports = router;