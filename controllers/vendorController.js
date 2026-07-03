const Vendor = require('../models/VendorProfile');
const User = require('../models/User');

// 1. REGISTER VENDOR CONTROLLER
const registerVendor = async (req, res) => {
    try {
        const { userId, user, businessName, businessType, location, description, documents } = req.body;
        const targetUserId = userId || user;

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID (userId) dena lazmi hai!" });
        }

        const userCheck = await User.findById(targetUserId);
        if (!userCheck) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            documentUrls = req.files.map(file => file.path);
        } else {
            documentUrls = documents || [];
        }

        let finalLocation = {
            city: req.body["location[city]"] || (location && location.city) || "Unknown",
            address: req.body["location[address]"] || (location && location.address) || "Unknown"
        };

        const newVendor = new Vendor({
            userId: targetUserId,
            businessName,
            category: businessType, 
            location: finalLocation,
            description,
            cnicImage: documentUrls[0] || ""
        });

        await newVendor.save();

        userCheck.role = 'vendor';
        await userCheck.save();

        res.status(201).json({
            success: true,
            message: "Vendor registered successfully!",
            vendor: newVendor
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. OPENSTREETMAP COORDINATES UPDATE CONTROLLER
const updateVendorLocation = async (req, res) => {
    try {
        const { latitude, longitude, vendorId } = req.body;

        if (latitude === undefined || longitude === undefined || !vendorId) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide latitude, longitude, and vendorId." 
            });
        }

        const updatedProfile = await Vendor.findOneAndUpdate(
            { _id: vendorId }, 
            { 
                $set: { 
                    "location.latitude": Number(latitude), 
                    "location.longitude": Number(longitude) 
                } 
            },
           { returnDocument: 'after' }
        );

        if (!updatedProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Vendor profile not found with this ID." 
            });
        }

        res.status(200).json({
            success: true,
            message: "OpenStreetMap coordinates updated successfully!",
            data: updatedProfile.location
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ===================================================================
// 🚀 3. NEW: SEARCH VENDORS BY LOCATION CONTROLLER (Asma's Fix)
// ===================================================================
const searchVendorsByLocation = async (req, res) => {
    try {
        // Frontend query params se city, lat, ya lng uthayega
        const { city, latitude, longitude } = req.query;
        let query = {};

        // Agar city di hui hai to case-insensitive search karein (e.g. "mandi bahauddin" ya "Mandi Bahauddin")
        if (city) {
            query["location.city"] = { $regex: city, $options: "i" };
        }

        // Agar exact coordinates se search karna ho
        if (latitude && longitude) {
            query["location.latitude"] = Number(latitude);
            query["location.longitude"] = Number(longitude);
        }

        // Database se matching vendors nikalna
        const vendors = await Vendor.find(query);

        return res.status(200).json({
            success: true,
            count: vendors.length,
            vendors
        });

    } catch (error) {
        console.error("Search Vendor Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Teeno functions ko export kar diya
module.exports = { registerVendor, updateVendorLocation, searchVendorsByLocation };