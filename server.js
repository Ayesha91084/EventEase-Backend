const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');

// Sahi Route Imports
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const ratingRoutes = require('./routes/ratingRoutes');

dotenv.config();
const app = express();

// Allowed Origins for Live Production (Vercel & Localhost)
const allowedOrigins = [
    'https://event-ease-frontend-main.vercel.app',
    'https://eventease-frontend-main.vercel.app', // Safe back-up url
    'http://localhost:3000',
    'http://localhost:5173'
];

// Middleware Configuration
app.use(express.json());

// Proper CORS Configuration for Live Handshake
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Create HTTP Server for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Sahi Middleware Route Connections
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ratings', ratingRoutes);

// Test Route to check if Backend is alive in browser
app.get("/", (req, res) => {
    res.status(200).send("EventEase API with Socket.io is running perfectly live!");
});

// Socket.io Real-time Chat Connection
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// Server Listen
// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log("MongoDB Connection Error:", err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Live Server started on port ${PORT}`));