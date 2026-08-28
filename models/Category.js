const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Category name is required'], 
        unique: true,
        trim: true
    },
    description: { 
        type: String,
        default: ""
    },
    icon: {
        type: String, // Dynamic Icon or Cloudinary Image URL for Frontend
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true // Admin is category ko enable/disable kar sakta hai
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);