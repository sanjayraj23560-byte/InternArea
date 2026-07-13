import mongoose from "mongoose";
const EngageSchema = new mongoose.Schema({
    senderId: {
        type: String, // Firebase uid string
        required: true,
        index: true
    },
    receiverId: {
        type: String, // Target user's _id or uid string
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate entries between the same pair of users
EngageSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
const Engage = mongoose.model('Engage', EngageSchema);

export default Engage