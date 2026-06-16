const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String }
}, { timestamps: true });

reviewSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Review', reviewSchema);