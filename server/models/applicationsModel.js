import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    company: String,

    category: String,

    coverLetter: String,

    user: Object,

    userId: {
        type: String, // Firebase UID
        ref: "User",
        required: true,
    },

    jobId: {
        type: String,
        required: true,
    },

    appliedAt: {
        type: Date,
        default: Date.now,
    },

    status: {
        type: String,
        enum: ["Pending", "Rejected", "Approved"],
        default: "Pending",
    },

    Application: Object,

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model(
    "ApplicationData",
    applicationSchema
);