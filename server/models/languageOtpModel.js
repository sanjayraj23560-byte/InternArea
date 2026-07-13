import mongoose from "mongoose";

const languageOtpSchema = new mongoose.Schema({
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

export default mongoose.models.LanguageOTP || mongoose.model("LanguageOTP", languageOtpSchema);