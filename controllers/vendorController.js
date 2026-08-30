const cloudinary = require('../utils/cloudinary');
const Vendor = require('../models/VendorProfile');
const User = require('../models/User');
const Category = require('../models/Category');

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
        const { userId, user, businessName, businessType, category, country, state, city, address, description, documents } = req.body;
        
        const targetUserId = req.user?.id || req.user?._id || userId || user || req.body.user;

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "User ID is required for vendor registration." });
        }

        // Prevent Duplicate Vendor Profiles
        const existingVendor = await Vendor.findOne({ userId: targetUserId });
        if (existingVendor) {
            return res.status(400).json({ success: false, message: "Vendor profile already exists for this account." });
        }

        let documentUrls = [];

        // Upload documents/CNIC via Cloudinary
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

        // Update User Role to Vendor
        const userCheck = await User.findById(targetUserId);
        if (userCheck) {
            userCheck.role = 'vendor';
            userCheck.isVerified = false; // Admin Approval Required
            await userCheck.save();
        }

        // Selected Category ObjectId validation check
        const selectedCategory = businessType || category;
        if (!selectedCategory) {
            return res.status(400).json({ success: false, message: "Category ObjectId is required for vendor profile." });
        }

        const newVendor = new Vendor({
            userId: targetUserId,
            businessName: businessName || "Event Vendor Professional",
            category: selectedCategory, 
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
// 🚀 3. GET LOGGED-IN VENDOR PROFILE (AUTHENTICATED & DYNAMIC SAFE)
// ===================================================================
const getVendorProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User authentication token or User ID is missing." 
      });
    }

    const vendor = await Vendor.findOne({ userId }).populate('category', 'name description');
    
    if (!vendor) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor profile not found" 
      });
    }

    return res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error("Get Vendor Profile Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error fetching profile", 
      error: error.message 
    });
  }
};

// ===================================================================
// 🚀 4. UPDATE VENDOR PROFILE DATA
// ===================================================================
const updateVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const { businessName, category, phone, city, address, description } = req.body;

    const updatedData = {};
    if (businessName) updatedData.businessName = businessName;
    if (phone) updatedData.phone = phone;
    if (description) updatedData.description = description;
    if (city) updatedData["location.city"] = city;
    if (address) updatedData["location.address"] = address;
    if (category) updatedData.category = category;

    const updatedVendor = await Vendor.findOneAndUpdate(
      { userId },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: "Vendor profile not found for updating." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      vendor: updatedVendor
    });
  } catch (error) {
    console.error("Update Vendor Profile Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

// ===================================================================
// 🚀 5. COORDINATES MAP GENERATOR
// ===================================================================
const updateVendorLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        // Vendor ID ko body, params ya authenticated user se find karne ki safe logic
        let targetVendorId = req.body.vendorId || req.params.vendorId;

        if (!targetVendorId) {
            // Agar request ke sath user id hai to uske zariye vendor find kar lein
            const userId = req.user?.id || req.user?._id || req.body.userId;
            if (userId) {
                const foundVendor = await Vendor.findOne({ userId });
                if (foundVendor) targetVendorId = foundVendor._id;
            }
        }

        if (latitude === undefined || longitude === undefined || !targetVendorId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing coordinates parameter fields or vendorId." 
            });
        }

        const updatedProfile = await Vendor.findOneAndUpdate(
            { _id: targetVendorId }, 
            { $set: { "location.latitude": Number(latitude), "location.longitude": Number(longitude) } },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ success: false, message: "Vendor profile not found for location update." });
        }

        return res.status(200).json({
            success: true,
            message: "Coordinates maps generated successfully!",
            data: updatedProfile.location
        });
    } catch (error) {
        console.error("Update Location Error:", error);
        return res.status(500).json({ success: false, message: "Map connection log failure.", error: error.message });
    }
};

// ===================================================================
// 🚀 7. GET ALL VENDORS (PUBLIC)
// ===================================================================
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ isVerified: true }).populate('userId', 'name email');
        return res.status(200).json({
            success: true,
            count: vendors.length,
            vendors
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching vendors", error: error.message });
    }
};

// ===================================================================
// 🚀 8. GET VENDOR BY ID (PUBLIC)
// ===================================================================
const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findById(id).populate('userId', 'name email');

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        return res.status(200).json({
            success: true,
            vendor
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching vendor details", error: error.message });
    }
};

// ===================================================================
// 🚀 9. PORTFOLIO MULTI-MEDIA UPLOAD
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

        let images = vendor.portfolioImages || [];
        let videos = vendor.portfolioVideos || [];

        let newImagesCount = req.files.filter(f => !f.mimetype.startsWith('video')).length;
        let newVideosCount = req.files.filter(f => f.mimetype.startsWith('video')).length;

        if (images.length + newImagesCount > 5) {
            return res.status(400).json({ 
                success: false, 
                message: `Portfolio limit exceeded: Max 5 images allowed. (Currently have ${images.length})` 
            });
        }

        if (videos.length + newVideosCount > 3) {
            return res.status(400).json({ 
                success: false, 
                message: `Portfolio limit exceeded: Max 3 videos allowed. (Currently have ${videos.length})` 
            });
        }

        for (const file of req.files) {
            const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const isVideo = file.mimetype.startsWith('video');

            if (isVideo) {
                const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                    resource_type: 'video',
                    folder: 'EventEase/vendors/portfolio/videos',
                });
                videos.push(uploadRes.secure_url);
            } else {
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
        console.error("Portfolio Upload Error:", error);
        return res.status(500).json({ success: false, message: "Media upload failed", error: error.message });
    }
};

// ===================================================================
// 🚀 10. DELETE PORTFOLIO MEDIA (NEW)
// ===================================================================
const deletePortfolioMedia = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { mediaUrl, type } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor profile not found" });
    }

    if (type === 'image') {
      vendor.portfolioImages = (vendor.portfolioImages || []).filter(img => img !== mediaUrl);
    } else if (type === 'video') {
      vendor.portfolioVideos = (vendor.portfolioVideos || []).filter(vid => vid !== mediaUrl);
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully!",
      portfolioImages: vendor.portfolioImages,
      portfolioVideos: vendor.portfolioVideos
    });
  } catch (error) {
    console.error("Delete Media Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete media", error: error.message });
  }
};

// Category fetch karne ke liye
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Category create karne ke liye
const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        return res.status(201).json({ success: true, category });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { 
  uploadProfilePicture, 
  registerVendor, 
  getVendorProfile,      
  updateVendorProfile,   
  updateVendorLocation, 
  searchVendorsByLocation,
  getAllVendors,
  getVendorById,
  uploadPortfolioMedia,
  deletePortfolioMedia,
  getCategories,  
  createCategory 
};