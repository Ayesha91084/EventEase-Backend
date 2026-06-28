const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');
const { Pool } = require('pg'); // SQL Driver Imported

// Route Imports
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes'); 
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const ratingRoutes = require('./routes/ratingRoutes');

dotenv.config();
const app = express();

const allowedOrigins = [
    'https://event-ease-frontend-djx3.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
];

app.use(express.json());

app.use(cors({
    origin: function (origin, callback) {
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

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true }
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ratings', ratingRoutes);

app.get("/", (req, res) => {
    res.status(200).send("EventEase Dual Database (MongoDB + PostgreSQL) is running live!");
});

// Socket.io Connection
io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => socket.join(roomId));
    socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
});

// ==========================================
// 🛠️ DUAL DATABASE CONFIGURATION (SATH SATH)
// ==========================================

// 1. Try Connecting MongoDB (Safe Mode)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully..."))
    .catch(err => console.log("⚠️ MongoDB Network Blocked, but Server is keeping alive! Error:", err.message));

// 2. Try Connecting PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("✅ PostgreSQL Connected Successfully for EventEase!"))
    .catch(err => console.log("❌ PostgreSQL Connection Error:", err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Live Server started on port ${PORT}`));