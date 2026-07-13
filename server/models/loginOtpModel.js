import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        required: true,
    },
});

export default mongoose.models.LoginOTP || mongoose.model("LoginOTP", loginOtpSchema);