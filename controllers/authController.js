// Login Logic
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check karna ke user database mein hai ya nahi
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 2. VENDOR APPROVAL CHECK
        if (user.role === 'vendor' && !user.isVerified) {
            return res.status(403).json({ 
                message: "Your registration request is pending approval from the Admin. Please wait." 
            });
        }

        // 3. PASSWORD BYPASS LOGIC FOR ADMIN & GENERAL MATCH
        let isMatch = false;
        if (user.role === 'admin' && password === 'AdminSecurePassword123') {
            isMatch = true; // Agar admin hai aur plain text sahi daala to direct enter karne do!
        } else {
            isMatch = await bcrypt.compare(password, user.password); // Baqi sab ke liye hashed check[cite: 2]
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // 4. JWT Token create karna
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};