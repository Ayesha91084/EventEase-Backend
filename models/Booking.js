const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
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

module.exports = mongoose.model('Booking', bookingSchema);