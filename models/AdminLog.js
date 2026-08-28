const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String, // e.g., "Deleted User", "Approved Vendor", "Updated System Settings"
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Jis target object (User/Vendor/Booking) par action liya gaya
    },
    targetModel: {
        type: String, // Dynamic ref model: 'User', 'VendorProfile', 'Booking'
        required: false
    },
    details: {
        type: String, // Extra details if needed (optional)
        default: ""
    }
}, { timestamps: true });

// Fast Audit Search Indexing
adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);