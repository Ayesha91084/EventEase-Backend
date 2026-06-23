const mongoose = require('mongoose');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log("MongoDB Connection Error:", err.message));
