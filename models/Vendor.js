const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User table se link
    businessName: { type: String, required: true },
    category: { type: String, enum: ['Catering', 'Photography', 'Decor', 'venues'], required: true },
    location: { type: String, default: 'Mandi Bahauddin' },
    description: { type: String },
    isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Vendor', VendorSchema);