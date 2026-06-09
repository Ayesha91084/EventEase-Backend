const vendorRoutes = require('./routes/vendorRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


dotenv.config();
const app = express();

// Middleware
app.use(express.json()); 
app.use(cors()); 
// Existing route imports ke sath ye add karo

// const bookingRoutes = require('./routes/bookingRoutes');

// Express middleware ke neechay routes define karo
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', require('./routes/paymentRoutes'));



// Routes connect karna

app.use('/api/admin', adminRoutes);



app.use('/api/auth', authRoutes);



//app.use('/api/admin', require('./routes/adminRoutes'));
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