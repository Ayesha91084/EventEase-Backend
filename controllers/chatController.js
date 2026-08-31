const Message = require('../models/Message');

// ==========================================
// 1. GET CHAT HISTORY (With Clean Pagination)
// ==========================================
// @route   GET /api/chat/room/:room
const getChatHistory = async (req, res) => {
    try {
        const { room } = req.params;

        if (!room) {
            return res.status(400).json({ success: false, message: "Room ID/Name is required." });
        }

        // 🛠️ Pagination Parameters Setup
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 20);
        const skip = (page - 1) * limit;

        // 1. Fetch latest messages (descending order by timestamp or createdAt)
        const messages = await Message.find({ room })
            .sort({ createdAt: -1, timestamp: -1 })
            .skip(skip)
            .limit(limit);

        // 2. Total count metrics for scroll triggers
        const totalMessages = await Message.countDocuments({ room });
        const totalPages = Math.ceil(totalMessages / limit);

        // Safe Immutable Reversal (Older -> Newer Order for UI alignment)
        const chronologicalMessages = [...messages].reverse();

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

// ==========================================
// 2. SAVE MESSAGE (HTTP Backup Flow + Socket.io Emission)
// ==========================================
// @route   POST /api/chat/save
const saveMessage = async (req, res) => {
    try {
        const { room, sender, message } = req.body;

        // Validation Check
        if (!room || !sender || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Room, Sender, and Message content are required." 
            });
        }

        const newMessage = new Message({ 
            room, 
            sender, 
            message,
            timestamp: new Date()
        });

        await newMessage.save();

        // 🚀 Realtime Broadcast via Socket.io (if attached to Express App)
        const io = req.app.get('io');
        if (io) {
            io.to(room).emit('receive_message', newMessage);
        }

        return res.status(201).json({ success: true, chat: newMessage });

    } catch (error) {
        console.error("Save Message Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
// ==========================================
// 3. START OR GET CONVERSATION
// ==========================================
// @route   POST /api/chat/conversation
const startConversation = async (req, res) => {
    try {
        const { vendorId } = req.body;
        const customerId = req.user._id;

        if (!vendorId) {
            return res.status(400).json({ success: false, message: "Vendor ID is required." });
        }

        // Aapke Message model ya ChatRoom model ke mutabiq room name ya ID generate ya find karna
        const roomName = `room_${Math.min(customerId, vendorId)}_${Math.max(customerId, vendorId)}`;

        return res.status(200).json({
            success: true,
            conversationId: roomName
        });

    } catch (error) {
        console.error("Start Conversation Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getChatHistory, saveMessage, startConversation };