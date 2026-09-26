const cloudinary = require('../utils/cloudinary');
const Vendor = require('../models/VendorProfile');
const User = require('../models/User');
const Category = require('../models/Category');

// 1. GET ALL APPROVED VENDORS (PUBLIC FRONTEND)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isVerified: true }).populate('userId', 'name email').populate('category', 'name');
    return res.status(200).json({
      success: true,
      data: vendors,
      vendors: vendors
    });
  } catch (error) {
    console.error("Get All Vendors Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch vendors", error: error.message });
  }
};

// 2. GET PENDING VENDORS (ADMIN NOTIFICATIONS & APPROVALS)
const getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await Vendor.find({ 
      $or: [
        { isVerified: false }, 
        { status: 'pending' }, 
        { isApproved: false }
      ] 
    }).populate('userId', 'name email').populate('category', 'name');
  

    return res.status(200).json({
      success: true,
      count: pendingVendors.length,
      data: pendingVendors,
      vendors: pendingVendors
    });
  } catch (error) {
    console.error("Get Pending Vendors Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pending vendors", error: error.message });
  }
};

// 3. APPROVE VENDOR
const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByIdAndUpdate(
      id, 
      { isVerified: true, status: 'approved', isApproved: true }, 
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor approved and published to website successfully!",
      data: vendor
    });
  } catch (error) {
    console.error("Approve Vendor Error:", error);
    return res.status(500).json({ success: false, message: "Failed to approve vendor", error: error.message });
  }
};

// 4. REJECT VENDOR
const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    await Vendor.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Vendor application rejected and removed."
    });
  } catch (error) {
    console.error("Reject Vendor Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject vendor", error: error.message });
  }
};

// 5. UPDATE VENDOR PROFILE DETAILS
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
      updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { $set: updatedData }, { new: true });
    }

    if (!updatedVendor && userId) {
      updatedVendor = await Vendor.findOneAndUpdate({ userId }, { $set: updatedData }, { new: true });
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

// 6. UPLOAD PROFILE PICTURE
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
      updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { profileImage: uploadResponse.secure_url }, { new: true });
    }

    if (!updatedVendor && userId) {
      updatedVendor = await Vendor.findOneAndUpdate({ userId }, { profileImage: uploadResponse.secure_url }, { new: true });
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

// 7. PORTFOLIO MULTI-MEDIA UPLOAD
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

// 8. DELETE PORTFOLIO MEDIA
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

// 9. REGISTER NEW VENDOR
const registerVendor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    const { businessName, category, phone, country, state, city, address, description } = req.body;

    if (!businessName || !category || !city || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let cnicImage = "";
    let licenseImage = "";
    if (req.files && req.files.length > 0) {
      const uploaded = [];
      for (const file of req.files) {
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploadRes = await cloudinary.uploader.upload(fileBase64, {
          folder: 'EventEase/vendors/documents',
        });
        uploaded.push(uploadRes.secure_url);
      }
      if (uploaded.length === 2) { cnicImage = uploaded[0]; licenseImage = uploaded[1]; }
      else if (uploaded.length === 1) { licenseImage = uploaded[0]; }
    }

    const vendor = await Vendor.create({
      userId,
      businessName,
      category,
      phone,
      description,
      location: { country, state, city, address },
      cnicImage,
      licenseImage,
      status: 'pending',
      isVerified: false
    });

    return res.status(201).json({
      success: true,
      message: "Vendor registered! Pending admin verification.",
      vendor
    });
  } catch (error) {
    console.error("Register Vendor Error:", error);
    return res.status(500).json({ success: false, message: "Vendor registration failed", error: error.message });
  }
};

// 10. GET VENDOR'S OWN PROFILE (BY USER ID)
const getVendorProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?._id;
    let vendor = await Vendor.findOne({ userId }).populate('category', 'name');
    if (!vendor) vendor = await Vendor.findById(req.params.userId).populate('category', 'name');

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }
    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 11. UPDATE VENDOR LOCATION (MAP / COORDINATES)
const updateVendorLocation = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { latitude, longitude, city, address, country, state } = req.body;

    const updatedData = {};
    if (latitude && longitude) updatedData['location.coordinates'] = [longitude, latitude];
    if (city) updatedData['location.city'] = city;
    if (address) updatedData['location.address'] = address;
    if (country) updatedData['location.country'] = country;
    if (state) updatedData['location.state'] = state;

    const vendor = await Vendor.findOneAndUpdate({ userId }, { $set: updatedData }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });

    return res.status(200).json({ success: true, message: "Location updated", vendor });
  } catch (error) {
    console.error("Update Location Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update location", error: error.message });
  }
};

// 12. SEARCH VENDORS (PUBLIC /vendors PAGE)
const searchVendorsByLocation = async (req, res) => {
  try {
    const { country, state, city, category } = req.query;
    const filter = { isVerified: true };
    if (country) filter['location.country'] = country;
    if (state) filter['location.state'] = state;
    if (city) filter['location.city'] = new RegExp(`^${city}$`, 'i');
    if (category) filter.category = category;

    const vendors = await Vendor.find(filter)
      .populate('category', 'name')
      .populate('userId', 'name email');

    return res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    console.error("Search Vendors Error:", error);
    return res.status(500).json({ success: false, message: "Failed to search vendors", error: error.message });
  }
};

// 13. GET SINGLE VENDOR BY ID
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('category', 'name');
    if (!vendor) return res.status(404).json({ success: false, message: "Vendor not found" });
    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 14. GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch categories", error: error.message });
  }
};

// 15. CREATE NEW CATEGORY (ADMIN)
const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }
    const category = await Category.create({ name, description, icon });
    return res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Create Category Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create category", error: error.message });
  }
};

module.exports = {
  getAllVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  updateVendorProfile,
  uploadProfilePicture,
  uploadPortfolioMedia,
  deletePortfolioMedia,
  registerVendor,
  getVendorProfile,
  updateVendorLocation,
  searchVendorsByLocation,
  getVendorById,
  getCategories,
  createCategory
};