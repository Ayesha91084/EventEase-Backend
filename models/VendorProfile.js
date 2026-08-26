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
  category: {
    type: String,
    default: "Decorator"
  },
  description: {
    type: String
  },
  
  // 🚀 Profile Picture URL (Cloudinary Link)
  profileImage: {
    type: String,
    default: ""
  },

  // 🚀 TASK 4: Cloudinary Multi-Media Portfolio Arrays (Enforcing 5 Images, 3 Videos)
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

  // Location details with OpenStreetMap coordinates
  location: {
    country: { type: String, default: "Pakistan" },
    state: { type: String, default: "Punjab" },
    city: { type: String, required: true },
    address: { type: String, required: true },
    
    latitude: { 
      type: Number, 
      required: false, 
      default: 32.5742 // Default Mandi Bahauddin latitude
    },
    longitude: { 
      type: Number, 
      required: false, 
      default: 73.4851 // Default Mandi Bahauddin longitude
    }
  },
  
  cnicImage: {
    type: String // Cloudinary URL for verification documents
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
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);