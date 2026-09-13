const cloudinary = require('../utils/cloudinary');
const Vendor = require('../models/VendorProfile');
const User = require('../models/User');
const Category = require('../models/Category');

// 1. UPDATE VENDOR PROFILE DETAILS
const updateVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const vendorId = req.body.vendorId;

    const { businessName, category, phone, city, address, description } = req.body;

    const updatedData = {};
    if (businessName) updatedData.businessName = businessName;
    if (phone) updatedData.phone = phone;
    if (description) updatedData.description = description;
    if (city) updatedData["location.city"] = city;
    if (address) updatedData["location.address"] = address;
    if (category) updatedData.category = category;

    let updatedVendor = null;

    if (vendorId && vendorId !== 'me') {
      updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: updatedData },
        { new: true, runValidators: false }
      );
    }

    if (!updatedVendor && userId) {
      updatedVendor = await Vendor.findOneAndUpdate(
        { userId },
        { $set: updatedData },
        { new: true, runValidators: false }
      );
    }

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: "Vendor profile record not found." });
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

// 2. PROFILE PICTURE UPLOAD CONTROLLER
const uploadProfilePicture = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const userId = req.user?.id || req.user?._id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'EventEase/vendors/profiles',
    });

    let updatedVendor = null;
    if (vendorId && vendorId !== 'me') {
      updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { profileImage: uploadResponse.secure_url },
        { new: true }
      );
    }

    if (!updatedVendor && userId) {
      updatedVendor = await Vendor.findOneAndUpdate(
        { userId },
        { profileImage: uploadResponse.secure_url },
        { new: true }
      );
    }

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

// 3. PORTFOLIO MULTI-MEDIA UPLOAD
const uploadPortfolioMedia = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const userId = req.user?.id || req.user?._id;

        let vendor = null;
        if (vendorId && vendorId !== 'me') {
            vendor = await Vendor.findById(vendorId);
        }

        if (!vendor && userId) {
            vendor = await Vendor.findOne({ userId });
        }

        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No media files uploaded" });
        }

        let images = vendor.portfolioImages || [];
        let videos = vendor.portfolioVideos || [];

        for (const file of req.files) {
            const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const isVideo = file.mimetype.startsWith('video');

            if (isVideo) {
                if (videos.length >= 3) continue;
                const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                    resource_type: 'video',
                    folder: 'EventEase/vendors/portfolio/videos',
                });
                videos.push(uploadRes.secure_url);
            } else {
                if (images.length >= 5) continue;
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

// 4. DELETE PORTFOLIO MEDIA
const deletePortfolioMedia = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { mediaUrl, type } = req.body;
    const userId = req.user?.id || req.user?._id;

    let vendor = null;
    if (vendorId && vendorId !== 'me') {
      vendor = await Vendor.findById(vendorId);
    }

    if (!vendor && userId) {
      vendor = await Vendor.findOne({ userId });
    }

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

// OTHER HELPER CONTROLLERS
const registerVendor = async (req, res) => { /* logic */ };
const getVendorProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id;
    let vendor = await Vendor.findOne({ userId });
    if (!vendor) vendor = await Vendor.findById(req.params.userId);

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
const updateVendorLocation = async (req, res) => { /* logic */ };
const searchVendorsByLocation = async (req, res) => { /* logic */ };
const getAllVendors = async (req, res) => { /* logic */ };
const getVendorById = async (req, res) => { /* logic */ };
const getCategories = async (req, res) => { /* logic */ };
const createCategory = async (req, res) => { /* logic */ };

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