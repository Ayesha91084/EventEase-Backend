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
    res.status(200).send("EventEase Multi-Database System (MongoDB + Render SQL + Neon SQL) is running live!");
});

// Socket.io Connection
io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => socket.join(roomId));
    socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
});

// ===================================================================
// 🛠️ MULTI-DATABASE PIPELINE (MONGO DB + DUAL POSTGRES FALLBACK)
// ===================================================================

// 1️⃣ MongoDB Atlas Connection (Safe Mode)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🟢 [DATABASE 1] -> MongoDB Connected Successfully..."))
    .catch(err => console.log("⚠️ [DATABASE 1] -> MongoDB Network Blocked, but Server is keeping alive! Error:", err.message));

// Global pool variable taake routes isi execution context ko use karein
let pool;

// 2️⃣ Dynamic Dual PostgreSQL Pipeline (Render vs Neon Fallback)
const initializePostgres = async () => {
    // A. Pehle Render Database (`DATABASE_URL`) try karein
    if (process.env.DATABASE_URL) {
        const renderPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await renderPool.query('SELECT NOW()');
            pool = renderPool;
            console.log("🟢 [DATABASE 2] -> Render PostgreSQL Deployed DB Connected!");
            return; // Agar connect ho gaya to yahi ruk jaye
        } catch (err) {
            console.log("🟡 [DATABASE 2] -> Render PostgreSQL Failed/Blocked. Trying Neon Cloud...");
        }
    }

    // B. Agar Render fail ho, toh Neon Database (`DATABASE_URL1`) connect karein
   if (process.env.DATABASE_URL1) {
        const neonPool = new Pool({
            connectionString: process.env.DATABASE_URL1,
            ssl: {
                rejectUnauthorized: false, // Local security layer bypass karne ke liye
                sslmode: 'verify-full'     // Warning error ko permanently shut down karne ke liye
            }
        });
        try {
            await neonPool.query('SELECT NOW()');
            pool = neonPool;
            console.log("🟢 [DATABASE 3] -> Neon.tech PostgreSQL (Lifetime Free) Connected Successfully!");
            return;
        } catch (err) {
            console.log("🔴 [DATABASE 3] -> Neon Cloud PostgreSQL Connection also Failed.");
        }
    }

    console.log("🚨 [CRITICAL ALERT] -> No SQL Database endpoints are available right now!");
};

// Database pipeline execute karein
initializePostgres();

// Pool export module level behavior maintain karne ke liye (if required by routes)
module.exports = { pool };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Live Server started on port ${PORT}`));