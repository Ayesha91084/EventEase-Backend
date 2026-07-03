const Message = require('../models/Message');

// @desc    Get chat history for a specific room (With Pagination)
// @route   GET /api/chat/room/:room
const getChatHistory = async (req, res) => {
    try {
        const { room } = req.params;

        // 🛠️ Pagination Parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // 1. Fetch latest messages from database
        const messages = await Message.find({ room })
            .sort({ timestamp: -1 }) // Latest messages first
            .skip(skip)
            .limit(limit);

        // 2. Count metrics for frontend scroll triggers
        const totalMessages = await Message.countDocuments({ room });
        const totalPages = Math.ceil(totalMessages / limit);

        // Reverse array back to chronological order for beautiful UI alignment
        const chronologicalMessages = messages.reverse();

        return res.status(200).json({ 
            success: true, 
            currentPage: page,
            totalPages,
            totalMessages,
            messages: chronologicalMessages 
        });

    } catch (error) {
        console.error("Chat History Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save message via HTTP (Optional / Backup flow)
// @route   POST /api/chat/save
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