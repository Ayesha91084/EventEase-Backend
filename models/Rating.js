const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile', // Jis vendor ko rating di ja rahi hai
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Jo customer rating de raha hai
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // Sirf 1 se 5 tak stars allow honge
    }
}, { timestamps: true });

module.exports = mongoose.model('Rating', RatingSchema);