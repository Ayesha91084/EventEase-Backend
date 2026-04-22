const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // JSON data read karne ke liye
app.use(cors());         // Frontend connection allow karne ke liye

// Routes connect karna
app.use('/api/auth', require('./routes/auth'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));