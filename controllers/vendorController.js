const cloudinary = require('../utils/cloudinary');
const Vendor = require('../models/VendorProfile');
const User = require('../models/User');

// ===================================================================
// 🚀 1. PROFILE PICTURE UPLOAD CONTROLLER (CLOUDINARY)
// ===================================================================
const uploadProfilePicture = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'EventEase/vendors/profiles',
    });

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { profileImage: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully!',
      imageUrl: uploadResponse.secure_url,
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

// ===================================================================
// 🚀 2. VENDOR REGISTRATION CONTROLLER (WITH CLOUDINARY UPLOAD)
// ===================================================================
const registerVendor = async (req, res) => {
    try {
        const { userId, user, businessName, businessType, country, state, city, address, description, documents } = req.body;
        
        const targetUserId = userId || user || req.body.user || "64b0f1a2c3d4e5f6a7b8c9d0";

        let documentUrls = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
                    folder: 'EventEase/vendors/documents',
                });
                documentUrls.push(uploadResponse.secure_url);
            }
        } else if (req.file) {
            const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
                folder: 'EventEase/vendors/documents',
            });
            documentUrls.push(uploadResponse.secure_url);
        } else if (documents) {
            documentUrls = Array.isArray(documents) ? documents : [documents];
        }

        let finalLocation = { 
            country: country || "Pakistan",
            state: state || "Punjab",
            city: city || "Mandi Bahauddin", 
            address: address || "Main Bazaar" 
        };

        const userCheck = await User.findById(targetUserId);
        if (userCheck) {
            userCheck.role = 'vendor';
            userCheck.isVerified = false; // Admin approval required
            await userCheck.save();
        }

        const newVendor = new Vendor({
            userId: targetUserId,
            businessName: businessName || "Event Vendor Professional",
            category: businessType || "Decorator", 
            location: finalLocation,
            description: description || "Providing premium event packages",
            cnicImage: documentUrls[0] || "mock-cloud-path.png"
        });

        await newVendor.save();

        return res.status(201).json({
            success: true,
            message: "Vendor registered successfully! Pending admin verification.",
            vendor: newVendor
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Vendor registration failed",
            error: error.message
        });
    }
};

// ===================================================================
// 🚀 3. COORDINATES MAP GENERATOR (OPENSTREETMAP/GEOLOCATION)
// ===================================================================
const updateVendorLocation = async (req, res) => {
    try {
        const { latitude, longitude, vendorId } = req.body;

        if (latitude === undefined || longitude === undefined || !vendorId) {
            return res.status(400).json({ success: false, message: "Missing coordinates parameter fields." });
        }

        const updatedProfile = await Vendor.findOneAndUpdate(
            { _id: vendorId }, 
            { $set: { "location.latitude": Number(latitude), "location.longitude": Number(longitude) } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Coordinates maps generated!",
            data: updatedProfile ? updatedProfile.location : { latitude, longitude }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Map connection log failure." });
    }
};

// ===================================================================
// 🚀 4. TASK 2: CASCADING SEARCH & VERIFIED VENDORS FILTER
// ===================================================================
const searchVendorsByLocation = async (req, res) => {
    try {
        const { country, state, city, category } = req.query;
        
        // Base Query: Only show approved vendors to public
        let query = {};

        if (country) query["location.country"] = { $regex: country, $options: "i" };
        if (state) query["location.state"] = { $regex: state, $options: "i" };
        if (city) query["location.city"] = { $regex: city, $options: "i" };
        if (category) query["category"] = { $regex: category, $options: "i" };

        const vendors = await Vendor.find(query).populate('userId', 'name email isVerified');
        
        // Filter out vendors where user isNotVerified if applicable
        const verifiedVendors = vendors.filter(v => v.userId && v.userId.isVerified !== false);

        return res.status(200).json({ 
            success: true, 
            count: verifiedVendors.length, 
            vendors: verifiedVendors 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Query log error.", error: error.message });
    }
};

module.exports = { 
  uploadProfilePicture, 
  registerVendor, 
  updateVendorLocation, 
  searchVendorsByLocation 
};