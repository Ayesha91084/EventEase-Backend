const vendorRoutes = require('./routes/vendorRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); 
app.use(cors()); 

// Routes connect karna
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);



app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', vendorRoutes);

// Test Route (Deployment check karne ke liye)
app.get("/", (req, res) => {
    res.send("EventEase API is running...");
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

// Port configuration for deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));