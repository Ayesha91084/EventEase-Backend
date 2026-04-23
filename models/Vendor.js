const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User table se link
    businessName: { type: String, required: true },
    category: { type: String, enum: ['Catering', 'Photography', 'Decor', 'venues'], required: true },
    location: { type: String, default: 'Mandi Bahauddin' },
    description: { type: String },
    isVerified: { type: Boolean, default: false },

// Verification aur Documents ke liye
documents: [{
    type: String // Yahan Cloudinary ke URLs save honge
}],
status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
},
// Revenue tracking ke liye
adminCommission: {
    type: Number,
    default: 10 // Percentage jo Admin lega
},
walletBalance: {
    type: Number,
    default: 0
}


















});


module.exports = mongoose.model('Vendor', VendorSchema);