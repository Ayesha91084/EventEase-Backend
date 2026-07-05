const Vendor = require('../models/VendorProfile');
const User = require('../models/User');

// 1. REGISTER VENDOR CONTROLLER
const registerVendor = async (req, res) => {
    try {
        const { userId, user, businessName, businessType, location, description, documents } = req.body;
        
        // Frontend handles alternate keys, extracting safely
        const targetUserId = userId || user || req.body.user;

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID dena lazmi hai!" });
        }

        const userCheck = await User.findById(targetUserId);
        if (!userCheck) {
            return res.status(404).json({ message: "User nahi mila database mein!" });
        }

        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            documentUrls = req.files.map(file => file.path);
        } else {
            documentUrls = documents || [];
        }

        // Safe extraction layer for incoming body stringified location structures
        let finalLocation = { city: "Unknown", address: "Unknown" };
        
        if (req.body.city) finalLocation.city = req.body.city;
        if (req.body.address) finalLocation.address = req.body.address;

        if (location) {
            try {
                const parsed = typeof location === 'string' ? JSON.parse(location) : location;
                if (parsed.city) finalLocation.city = parsed.city;
                if (parsed.address) finalLocation.address = parsed.address;
            } catch (e) {
                // Raw key checks if fallback parser encounters standard JSON strings
                finalLocation.city = req.body["location[city]"] || "Unknown";
                finalLocation.address = req.body["location[address]"] || "Unknown";
            }
        }

        const newVendor = new Vendor({
            userId: targetUserId,
            businessName: businessName || "Event Vendor",
            category: businessType || "Decorator", 
            location: finalLocation,
            description: description || "",
            cnicImage: documentUrls[0] || ""
        });

        await newVendor.save();

        userCheck.role = 'vendor';
        await userCheck.save();

        return res.status(201).json({
            success: true,
            message: "Vendor registered successfully!",
            vendor: newVendor
        });

    } catch (error) {
        return res.status(500).json({ message: "Server Error inside Vendor Controller", error: error.message });
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

        return res.status(200).json({
            success: true,
            message: "OpenStreetMap coordinates updated successfully!",
            data: updatedProfile.location
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// 3. SEARCH VENDORS BY LOCATION CONTROLLER
const searchVendorsByLocation = async (req, res) => {
    try {
        const { city, latitude, longitude } = req.query;
        let query = {};

        if (city) {
            query["location.city"] = { $regex: city, $options: "i" };
        }

        if (latitude && longitude) {
            query["location.latitude"] = Number(latitude);
            query["location.longitude"] = Number(longitude);
        }

        const vendors = await Vendor.find(query);

        return res.status(200).json({
            success: true,
            count: vendors.length,
            vendors
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

module.exports = { registerVendor, updateVendorLocation, searchVendorsByLocation };