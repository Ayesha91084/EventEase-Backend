const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageDetails: {
        packageName: { type: String, required: true },
        basePrice: { type: Number, required: true },
        extras: { type: Array, default: [] },
        perHead: { type: Boolean, default: false },
        guestCount: { type: Number, default: 1 },
    },
    eventDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'confirmed', 'cancelled', 'completed'], 
        default: 'pending' 
    },
    totalAmount: { type: Number, required: true },
    
    // 🚀 TASK 6: Dynamic Admin Commission & Vendor Payout Fields
    commissionRate: { type: Number, default: 10 }, // 10% Default Platform Fee
    adminCommission: { type: Number, default: 0 },
    vendorPayout: { type: Number, default: 0 },
    
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'refunded'], 
        default: 'pending' 
    },
    paymentIntentId: { type: String, default: "" }
}, { timestamps: true });

bookingSchema.index({ customer: 1 });
bookingSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);