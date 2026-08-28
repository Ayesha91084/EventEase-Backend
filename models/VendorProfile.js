const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ek user ka sirf ek hi vendor profile ho sakta hai
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Linked with Category model
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ""
    },
    
    // Cloudinary Profile Picture
    profileImage: {
        type: String,
        default: ""
    },

    // 🚀 Task 4: Cloudinary Multi-Media Portfolio Arrays Validation
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

    // OpenStreetMap Location & GeoJSON GeoSpatial Query Setup
    location: {
        country: { type: String, default: "Pakistan" },
        state: { type: String, default: "Punjab" },
        city: { type: String, required: true },
        address: { type: String, required: true },
        
        // GeoJSON standard for OpenStreetMap proximity search
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Format: [longitude, latitude]
            default: [73.4851, 32.5742] // Mandi Bahauddin [Lng, Lat]
        }
    },
    
    cnicImage: {
        type: String // Cloudinary URL for verification document
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

// 🚀 Fast Filters & Spatial Search Indexing
vendorProfileSchema.index({ "location": "2dsphere" }); // Proximity location search
vendorProfileSchema.index({ category: 1 });
vendorProfileSchema.index({ status: 1 });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);