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
        enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
        default: 'pending' 
    },
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'refunded'], 
        default: 'pending' 
    }
}, { timestamps: true });

bookingSchema.index({ customer: 1 });
bookingSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);