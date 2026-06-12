const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); // Built-in Node module
const { Server } = require('socket.io'); // Socket.io Package

// Route Imports
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
const app = express();

// Create HTTP Server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
    cors: {
        origin: "*", // Frontend local/live URL bhee de sakte hain baad me
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes Connect karna
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));

// Test Route
app.get("/", (req, res) => {
    res.send("EventEase API with Socket.io is running...");
});

// --- Real-time Chat Logic (Socket.io Events) ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // User jab chat room join karega (Room ID specific booking ya customer-vendor id hogi)
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    // Message receive karna aur room ke baqi users ko forward karna
    socket.on('send_message', (data) => {
        // data me sender, receiver, message text, aur roomId hoga
        socket.to(data.room).emit('receive_message', data);
    });

    // Disconnect Handle karna
    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

// Server Listen (Ab 'app.listen' ki jagah 'server.listen' use hoga)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));