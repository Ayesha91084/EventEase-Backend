const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String, // e.g., "Wedding", "Catering"
        required: true
    },
    images: [{
        type: String // Portfolio images array from Cloudinary
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

serviceSchema.index({ categoryId: 1 }); // Category wise search ke liye
serviceSchema.index({ price: 1 }); // Price range filter ke liye

module.exports = mongoose.model('Service', serviceSchema);