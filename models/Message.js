const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
        trim: true
        // Room Identifier (e.g., "booking_65a1b2c3" ya "customerID_vendorID")
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false // Read/Unread message indicator for UI
    }
}, { timestamps: true });

// 🚀 Fast Chat History Retrieval Index
MessageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);