import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        planName: {
            type: String,
            enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
            default: "FREE",
        },
        planAmount: {
            type: Number,
            default: 0,
        },
        orderId: {
            type: String,
            default: null,
        },
        paymentId: {
            type: String,
            default: null,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        applicationsUsed: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);