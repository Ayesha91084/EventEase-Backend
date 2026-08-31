const express = require('express');
const router = express.Router();

// 1. Controllers Import
const { getChatHistory, saveMessage } = require('../controllers/chatController');

// 2. Auth Middleware Import
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🛠️ CHAT ROUTES DEFINITION
// ==========================================

// 1. Fetch Chat History Endpoint
// #swagger.tags = ['Chat']
// Asma Jab frontend se call karegi: /api/chat/room/room_123?page=1&limit=20
router.get('/room/:room', protect, getChatHistory);

// 2. Fallback HTTP Message Save Endpoint
// #swagger.tags = ['Chat']
// Message HTTP API route se save karne ke liye: POST /api/chat/save
router.post('/save', protect, saveMessage);
// 3. Start or Get Conversation Endpoint
// #swagger.tags = ['Chat']
router.post('/conversation', protect, startConversation);

module.exports = router;