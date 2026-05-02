const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'online' }, // e.g., Card, EasyPaisa
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
    transactionId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);