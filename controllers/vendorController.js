const Vendor = require('../models/Vendor');
const User = require('../models/User');

// Vendor Register karne ka function
const registerVendor = async (req, res) => {
    try {
        // 1. Frontend se data pakarna
        const { userId, businessName, businessType, location, description } = req.body;

        // 2. Check karna ke user valid hai ya nahi
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User nahi mila!" });
        }

        // 3. Cloudinary ke links nikalna (req.files se)
        // Multer images upload karke humein unka path (URL) deta hai
        const documentUrls = req.files.map(file => file.path);

        // 4. Naya Vendor database mein save karna
        const newVendor = new Vendor({
            user: userId,
            businessName,
            businessType,
            location,
            description,
            documents: documentUrls, // Cloudinary URLs yahan save ho rahe hain
            status: 'Pending' // Admin abhi check karega
        });

        await newVendor.save();

        // 5. User ka role change karke 'vendor' kar dena
        user.role = 'vendor';
        await user.save();

        res.status(201).json({
            success: true,
            message: "Vendor ki application jama ho gayi hai. Admin approve karega.",
            vendor: newVendor
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { registerVendor };