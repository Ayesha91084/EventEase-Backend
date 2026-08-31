const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // Explicit Room ID string for Socket.io room joining
    room: {
        type: String,
        required: true,
        trim: true
    },
    // Customer aur Vendor IDs
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }],
    // Associated Booking reference (Optional/Contextual)
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking',
        required: false 
    },
    // Inbox Preview Helpers
    lastMessage: {
        type: String,
        default: ""
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound Indexing for Fast Chat Room Retrieval
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);