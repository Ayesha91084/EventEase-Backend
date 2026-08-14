const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Forces Node to use Google DNS for MongoDB




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

const swaggerDocument = require('./swagger-output.json');
 
// Middleware

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
 
app.use(cors({

    origin: true, 

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

    cors: { origin: true, methods: ["GET", "POST"], credentials: true }

});
 
// API Routes

app.use('/api/bookings', bookingRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/auth', authRoutes); 

app.use('/api/vendors', vendorRoutes);

app.use('/api/chat', chatRoutes); 

app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use('/api/ratings', ratingRoutes);
 
app.get("/", (req, res) => {

    res.status(200).send("EventEase Live Server Running.");

});
 
// Socket.IO Events

io.on('connection', (socket) => {

    socket.on('join_room', (roomId) => socket.join(roomId));

    socket.on('send_message', (data) => socket.to(data.room).emit('receive_message', data));

});
 
// Detailed MongoDB Connection Pipeline with Fallback & Proper Options

const mongoURI = process.env.MONGO_URI;

const shortURI = mongoURI ? mongoURI.split('@')[1] || "Configured Link" : "No URI Found";
 
const connectDB = async () => {

    try {

        await mongoose.connect(mongoURI, {

            serverSelectionTimeoutMS: 15000, // Increased timeout to 15s to allow for local DNS/network latency

            family: 4,                       // Force IPv4 (fixes many Windows local network delays)

            maxPoolSize: 10,                 // Maintains up to 10 open sockets

            socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity

        });

        console.log("------------------------------------------------");

        console.log("DATABASE: MongoDB Connected Successfully!");

        console.log(`CLUSTER: ${shortURI}`);

        console.log("------------------------------------------------");

    } catch (err) {

        console.log("-------------------- DB ERROR --------------------");

        console.error("ERROR NAME:", err.name);

        console.error("ERROR MESSAGE:", err.message);

        console.log("--------------------------------------------------");

    }

};
 
// Handle disconnects while the server is running

mongoose.connection.on('disconnected', () => {

    console.warn("DATABASE WARNING: Lost connection to MongoDB. Attempting to reconnect...");

});
 
connectDB();
 
// Start Server

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`SERVER: Started on port ${PORT}`));
 

 