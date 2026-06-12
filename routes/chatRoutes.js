const express = require('express');
const router = express.Router();
const { getChatHistory, saveMessage } = require('../controllers/chatController');

router.get('/:room', getChatHistory);
router.post('/save', saveMessage);

module.exports = router;