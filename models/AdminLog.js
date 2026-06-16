const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String, // e.g., "Deleted User", "Approved Vendor"
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Jis user ya service par action liya gaya
    }
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);