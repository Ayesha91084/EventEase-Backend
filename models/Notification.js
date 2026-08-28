const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String, 
        enum: ['booking', 'payment', 'chat', 'vendor_approval', 'general'], 
        default: 'general'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Click action link/navigation help
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Booking ID ya Chat Room ID redirection ke liye
    }
}, { timestamps: true });

// 🚀 Indexing for fast Unread Notifications fetch
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);