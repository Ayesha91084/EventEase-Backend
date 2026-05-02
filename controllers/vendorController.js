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
// File ke aakhir mein ye lazmi likhen
module.exports = { registerVendor };