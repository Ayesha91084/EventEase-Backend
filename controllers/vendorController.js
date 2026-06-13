const Vendor = require('../models/VendorProfile');
const User = require('../models/User');

const registerVendor = async (req, res) => {
    try {
        const { userId, businessName, businessType, location, description, documents } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        // SOLUTION: Pehle check karo req.files hai ya nahi
        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            // Agar file upload ki hai (automatic)
            documentUrls = req.files.map(file => file.path);
        } else {
            // Agar Thunder Client se direct links bheje hain (manual)
            documentUrls = documents;
        }

        const newVendor = new Vendor({
            user: userId,
            businessName,
            category: businessType, 
            location,
            description,
            documents: documentUrls, 
            status: 'Pending'
        });

        await newVendor.save();

        user.role = 'vendor';
        await user.save();

        res.status(201).json({
            success: true,
            message: "Vendor registered successfully!",
            vendor: newVendor
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 👇 OPENSTREETMAP COORDINATES UPDATE CONTROLLER 👇
const updateVendorLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        // Validation check
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide both latitude and longitude values." 
            });
        }

        // Database Update Logic: req.user.id se profile find kar ke update karega
        const updatedProfile = await Vendor.findOneAndUpdate(
            { user: req.user.id }, // original schema mein 'user' field use ho rahi hai
            { 
                $set: { 
                    "location.latitude": Number(latitude), 
                    "location.longitude": Number(longitude) 
                } 
            },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "Vendor profile not found for this authenticated user." 
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

// Dono functions ko export kar diya hai
module.exports = { registerVendor, updateVendorLocation };