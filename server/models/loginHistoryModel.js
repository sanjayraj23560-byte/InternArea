import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            required: true,
            index: true,
        },
        email: String,
        browser: String,
        os: String,
        // Note: browsers only expose Mobile / Tablet / Desktop — there's no
        // signal that distinguishes a laptop from a desktop tower.
        deviceType: {
            type: String,
            enum: ["Mobile", "Tablet", "Desktop"],
            default: "Desktop",
        },
        ip: String,
        status: {
            type: String,
            enum: ["Success", "Blocked - Outside Hours", "OTP Sent", "OTP Verified", "OTP Failed"],
            default: "Success",
        },
        reason: String,
    },
    { timestamps: true }
);

export default mongoose.models.LoginHistory || mongoose.model("LoginHistory", loginHistorySchema);