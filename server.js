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
const app = express(); // 👈 'app' properly created

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

// ===================================================================
// 🔓 CORS CONFIGURATION - ALLOW ALL ORIGINS (BINA KISI BLOCK KE)
// ===================================================================
app.use(cors({
    origin: true, // Har tarah ki origin/website ko allow karega
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ===================================================================
// 🛠️ KEEP-ALIVE HEALTH API
// ===================================================================
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is Active and Awake!",
    timestamp: new Date()
  });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: true, // Socket connections ko bhi fully open kar diya
        methods: ["GET", "POST"], 
        credentials: true 
    }
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