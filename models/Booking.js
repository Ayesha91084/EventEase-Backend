const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    eventDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending' 
    },
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },

totalAmount: { type: Number, required: true },
advancePaid: { type: Number, default: 0 }, // 30% amount yahan save hogi
balancePending: { type: Number, default: 0 }, // 70% yahan
paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Advance Paid', 'Fully Paid'],
    default: 'Unpaid'
}














});

module.exports = mongoose.model('Booking', BookingSchema);