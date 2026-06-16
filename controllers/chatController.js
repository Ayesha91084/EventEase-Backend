const Message = require('../models/Message');

// @desc    Get chat history for a specific room
// @route   GET /api/chat/:room
const getChatHistory = async (req, res) => {
    try {
        const { room } = req.params;
        const messages = await Message.find({ room }).sort({ timestamp: 1 });
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Chat History Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save message via HTTP (Optional / Backup flow)
const saveMessage = async (req, res) => {
    try {
        const { room, sender, message } = req.body;
        const newMessage = new Message({ room, sender, message });
        await newMessage.save();
        return res.status(201).json({ success: true, chat: newMessage });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getChatHistory, saveMessage };