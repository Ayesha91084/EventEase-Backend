const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        city: { type: String, required: true },
        address: { type: String, required: true }
    },
    cnicImage: {
        type: String // Cloudinary URL for verification documents
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);