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
        
        // Priority check for auth token id or body user id
        const targetUserId = req.user?.id || req.user?._id || userId || user || req.body.user;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "User ID is required for vendor registration." });
        }

        let documentUrls = [];

        // Handle uploaded file buffers via Multer
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

        // Update User Role and verification status
        const userCheck = await User.findById(targetUserId);
        if (userCheck) {
            userCheck.role = 'vendor';
            userCheck.isVerified = false; // Requires Admin Approval
            await userCheck.save();
        }

        const newVendor = new Vendor({
            userId: targetUserId,
            businessName: businessName || "Event Vendor Professional",
            category: businessType || "Decorator", 
            location: finalLocation,
            description: description || "Providing premium event packages",
            cnicImage: documentUrls[0] || "",
            isVerified: false,
            status: 'pending'
        });

        await newVendor.save();

        return res.status(201).json({
            success: true,
            message: "Vendor registered successfully! Pending admin verification.",
            vendor: newVendor
        });

    } catch (error) {
        console.error("Vendor Register Error:", error);
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
// 🚀 4. CASCADING SEARCH & VERIFIED VENDORS ONLY
// ===================================================================
const searchVendorsByLocation = async (req, res) => {
    try {
        const { country, state, city, category } = req.query;
        
        let query = { isVerified: true };

        if (country) query["location.country"] = { $regex: country, $options: "i" };
        if (state) query["location.state"] = { $regex: state, $options: "i" };
        if (city) query["location.city"] = { $regex: city, $options: "i" };
        if (category) query["category"] = { $regex: category, $options: "i" };

        const vendors = await Vendor.find(query).populate('userId', 'name email isVerified');
        const verifiedVendors = vendors.filter(v => v.userId && v.userId.isVerified === true);

        return res.status(200).json({ 
            success: true, 
            count: verifiedVendors.length, 
            vendors: verifiedVendors 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Query log error.", error: error.message });
    }
};

// ===================================================================
// 🚀 5. CLOUDINARY PORTFOLIO MULTI-MEDIA UPLOAD (MAX 5 IMAGES, MAX 3 VIDEOS)
// ===================================================================
const uploadPortfolioMedia = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No media files uploaded" });
        }

        let images = [...vendor.portfolioImages];
        let videos = [...vendor.portfolioVideos];

        for (const file of req.files) {
            const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const isVideo = file.mimetype.startsWith('video');

            if (isVideo) {
                if (videos.length >= 3) {
                    return res.status(400).json({ success: false, message: "Maximum limit reached: Only 3 videos allowed per portfolio." });
                }
                const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                    resource_type: 'video',
                    folder: 'EventEase/vendors/portfolio/videos',
                });
                videos.push(uploadRes.secure_url);
            } else {
                if (images.length >= 5) {
                    return res.status(400).json({ success: false, message: "Maximum limit reached: Only 5 images allowed per portfolio." });
                }
                const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                    folder: 'EventEase/vendors/portfolio/images',
                });
                images.push(uploadRes.secure_url);
            }
        }

        vendor.portfolioImages = images;
        vendor.portfolioVideos = videos;
        await vendor.save();

        return res.status(200).json({
            success: true,
            message: "Portfolio media updated successfully!",
            portfolioImages: vendor.portfolioImages,
            portfolioVideos: vendor.portfolioVideos
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Media upload failed", error: error.message });
    }
};

module.exports = { 
  uploadProfilePicture, 
  registerVendor, 
  updateVendorLocation, 
  searchVendorsByLocation,
  uploadPortfolioMedia
};