const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');

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

const swaggerUi = require('swagger-ui-express');
let swaggerDocument;
try {
    swaggerDocument = require('./swagger-output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.log("Swagger doc not loaded");
}

// Middleware
app.use(express.json());

app.use(cors({
    origin: '*', 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Health Check Route
app.get('/api/health-check', (req, res) => {
    res.status(200).json({ status: "success", message: "Server is Active" });
});

// HTTP & Socket Server Setup
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true }
});

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/chat', chatRoutes); 

try {
    app.use('/api/notifications', require('./routes/notificationRoutes'));
} catch (e) {
    console.log("Notification route skipped or not found.");
}

app.use('/api/ratings', ratingRoutes);

app.get("/", (req, res) => {
    res.status(200).send("EventEase Live Server Running.");
});

// Socket.IO Events
io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => socket.join(roomId));
    socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log("DATABASE: MongoDB Connected Successfully!");
    } catch (err) {
        console.error("DB ERROR:", err.message);
    }
};

connectDB();

// Render and Production Ready Server Port Listening
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`------------------------------------------------`);
    console.log(`SERVER: Started successfully on port ${PORT}`);
    console.log(`------------------------------------------------`);
});

module.exports = app;