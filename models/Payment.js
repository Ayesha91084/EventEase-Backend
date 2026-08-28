const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'VendorProfile', 
        required: false 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    currency: {
        type: String,
        default: 'PKR'
    },
    method: { 
        type: String, 
        enum: ['card', 'easypaisa', 'jazzcash', 'stripe', 'cash'],
        default: 'card' 
    },
    status: { 
        type: String, 
        enum: ['success', 'failed', 'pending', 'refunded'], 
        default: 'pending' 
    },
    transactionId: { 
        type: String, 
        required: true,
        unique: true, // Duplicate transaction entry guard
        trim: true
    },
    // Audit Trail Snapshot Fields
    adminCommission: { 
        type: Number, 
        default: 0 
    },
    vendorPayout: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

// 🚀 Fast Financial Reporting Queries Indexing
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);