const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: true,
        unique: true // Ek booking par sirf EK hi review submit ho sakta hai
    },
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'VendorProfile', // Fixed: Linked to VendorProfile
        required: true 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    comment: { 
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

// Fast Search Query Indexing
reviewSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Review', reviewSchema);