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
  
  // Is location object ko update karna hai:
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    
    // 👇 OPENSTREETMAP COORDINATES ADDED HERE 👇
    latitude: { 
      type: Number, 
      required: false, 
      default: 32.5742 // Default Mandi Bahauddin ka latitude takay crash na ho
    },
    longitude: { 
      type: Number, 
      required: false, 
      default: 73.4851 // Default Mandi Bahauddin ka longitude takay crash na ho
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