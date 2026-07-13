import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
    identifier: {
        type: String, // Stores either the email or phone number string
        required: true,
        index: true
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically deletes the document after 24 hours (86400 seconds)
    }
});

const PasswordReset = mongoose.model("PasswordReset", PasswordResetSchema);
export default PasswordReset;