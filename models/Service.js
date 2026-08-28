const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorProfile', // Fixed: Linked to VendorProfile model
        required: true
    },
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Service base price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Fixed: Linked to Category model reference
        required: true
    },
    images: [{
        type: String // Portfolio Cloudinary image URLs
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// 🚀 Fast Query Indexing (Fixed Index Mismatch)
serviceSchema.index({ category: 1 }); // Category filter fast query
serviceSchema.index({ price: 1 });    // Price sorting filter
serviceSchema.index({ vendorId: 1 }); // Vendor specific services lookup

module.exports = mongoose.model('Service', serviceSchema);