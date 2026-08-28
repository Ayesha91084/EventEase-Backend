const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const mongoose = require('mongoose');

// 1. Environment Variables Config
dotenv.config();

const app = express();

// 2. Swagger Documentation Integration
const swaggerUi = require('swagger-ui-express');
try {
    const swaggerDocument = require('./swagger-output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.log("INFO: Swagger doc not loaded or file missing.");
}

// 3. Core Middlewares Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*', 
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 4. API Route Imports
const authRoutes = require('./routes/authRoutes'); 
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const ratingRoutes = require('./routes/ratingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// 5. API Route Bindings
app.use('/api/auth', authRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check & Root Endpoints
app.get('/api/health-check', (req, res) => {
    res.status(200).json({ status: "success", message: "EventEase Backend Active & Healthy" });
});

app.get("/", (req, res) => {
    res.status(200).send("EventEase Live Server Running.");
});

// 6. HTTP Server & Real-Time Socket.IO Binding
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true }
});

// Live Chat Socket Handlers
io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        // Socket connection disconnect log
    });
});

// 7. MongoDB Connection & Server Startup Pipeline
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log("DATABASE: MongoDB Connected Successfully!");

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`------------------------------------------------`);
            console.log(`SERVER: EventEase Backend running on port ${PORT}`);
            console.log(`------------------------------------------------`);
        });
    } catch (err) {
        console.error("CRITICAL: DB Connection Failed!", err.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;