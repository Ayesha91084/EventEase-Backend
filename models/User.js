const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer'
    },
    phone: {
        type: String
    },
    profileImage: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexing for performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);