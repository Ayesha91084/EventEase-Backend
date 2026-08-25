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
  
  // 🚀 NEW: Profile Picture URL (Cloudinary Link Save Karne Ke Liye)
  profileImage: {
    type: String,
    default: ""
  },

  // Location details with OpenStreetMap coordinates
  location: {
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