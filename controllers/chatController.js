const Message = require('../models/Message');

// @desc    Get chat history for a specific room (With Pagination)
// @route   GET /api/chat/:room
const getChatHistory = async (req, res) => {
    try {
        const { room } = req.params;

        // 🛠️ Pagination Parameters (Req.query se page aur limit uthein ge)
        // Agar frontend se page nahi aya toh default 1 hoga, aur ek waqt mein 20 messages load honge
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // 1. Pehle messages find karein, sort(-1) se latest messages pehle ayen ge, 
        // skip aur limit lga kar pagination control hogi.
        const messages = await Message.find({ room })
            .sort({ timestamp: -1 }) // Latest messages top par (MERN chat standard)
            .skip(skip)
            .limit(limit);

        // 2. Total messages kitne hain is room mein (Frontend ko batane ke liye ke mazeed data hai ya nahi)
        const totalMessages = await Message.countDocuments({ room });
        const totalPages = Math.ceil(totalMessages / limit);

        // 👈 Imp Step: Chat UI standard ke mutabiq frontend ko data seedha (Chronological) bhejna hota hai
        // Isliye database se ulta (latest) nikal kar response bhejne se pehle array ko seedha (.reverse()) kar dia.
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