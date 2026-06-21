const Vendor = require('../models/VendorProfile');
const User = require('../models/User');

/*const registerVendor = async (req, res) => {
    try {
        // Tumhare schema ke mutabiq yahan 'user' hi aayega (jo customer ki ID hoti hai)
        const { user, businessName, businessType, location, description, documents } = req.body;

        // Original database verification check
        const userCheck = await User.findById(user);
        if (!userCheck) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        // Files handle karne ki logic
        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            documentUrls = req.files.map(file => file.path);
        } else {
            documentUrls = documents || [];
        }

        // Naya vendor profile banana tumhare original schema fields ke sath
        const newVendor = new Vendor({
            user, // Sahi schema field
            businessName,
            category: businessType, 
            location,
            description,
            documents: documentUrls, 
            status: 'Pending'
        });

        await newVendor.save();

        // User ka role update kar ke 'vendor' karna
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
};*/
const registerVendor = async (req, res) => {
    try {
        // Hum req.body se data nikal rahe hain
        const { userId, user, businessName, businessType, location, description, documents } = req.body;

        // Dono mein se jo bhi ID mil jaye (chahe Postman se 'userId' aaye ya 'user')
        const targetUserId = userId || user;

        if (!targetUserId) {
            return res.status(400).json({ message: "User ID (userId) dena lazmi hai!" });
        }

        // Database mein check karein ke user majood hai ya nahi
        const userCheck = await User.findById(targetUserId);
        if (!userCheck) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        // Files handle karne ki logic
        let documentUrls = [];
        if (req.files && req.files.length > 0) {
            documentUrls = req.files.map(file => file.path);
        } else {
            documentUrls = documents || [];
        }

        // Location object handle karne ki safe logic (form-data support ke liye)
        let finalLocation = {
            city: req.body["location[city]"] || (location && location.city) || "Unknown",
            address: req.body["location[address]"] || (location && location.address) || "Unknown"
        };

        // Naya vendor profile banana schema ke mutabiq exact 'userId' use kar ke
        const newVendor = new Vendor({
            userId: targetUserId, // 👈 Ab schema ko exact 'userId' hi milega, error khatam!
            businessName,
            category: businessType, 
            location: finalLocation,
            description,
            cnicImage: documentUrls[0] || "" // Documents array se pehli image cnicImage mein dal di
        });

        await newVendor.save();

        // User ka role update kar ke 'vendor' karna
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



// 👇 OPENSTREETMAP COORDINATES UPDATE CONTROLLER 👇
const updateVendorLocation = async (req, res) => {
    try {
        const { latitude, longitude, vendorId } = req.body;

        // Validation check
        if (latitude === undefined || longitude === undefined || !vendorId) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide latitude, longitude, and vendorId." 
            });
        }

        // Database Update Logic
        const updatedProfile = await Vendor.findOneAndUpdate(
            { _id: vendorId }, 
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

// Dono functions ko export kar diya hai
module.exports = { registerVendor, updateVendorLocation };