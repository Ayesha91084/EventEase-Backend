const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    portfolioImages: {
        type: [String],
        validate: [val => val.length <= 5, 'Maximum 5 portfolio images allowed.'],
        default: []
    },
    portfolioVideos: {
        type: [String],
        validate: [val => val.length <= 3, 'Maximum 3 portfolio videos allowed.'],
        default: []
    },
    location: {
        country: { type: String, default: "Pakistan" },
        state: { type: String, default: "Punjab" },
        city: { type: String, required: true },
        address: { type: String, required: true },
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [73.4851, 32.5742]
        }
    },
    cnicImage: {
        type: String
    },
    licenseImage: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

vendorProfileSchema.index({ "location": "2dsphere" });
vendorProfileSchema.index({ category: 1 });
vendorProfileSchema.index({ status: 1 });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);