const chatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });