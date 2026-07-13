import express from "express";
import PasswordReset from "../models/passwordResetModel.js";

const router = express.Router();

// Helper Function: Generates a completely alphabetic random password string
const generateAlphabetPassword = (length = 10) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

router.post("/forgot-password", async (req, res) => {
    const { identifier } = req.body; // Can be email or phone number passed from client

    if (!identifier || !identifier.trim()) {
        return res.status(400).json({ message: "Please provide a registered email or phone number." });
    }

    try {
        // 1. Enforce the once-per-day rule by checking if a record exists
        const cleanIdentifier = identifier.trim().toLowerCase();
        const existingRequest = await PasswordReset.findOne({ identifier: cleanIdentifier });

        if (existingRequest) {
            return res.status(429).json({ 
                message: "You can use this option only once per day." 
            });
        }

        const temporaryPassword = generateAlphabetPassword(12);

        const newResetRecord = new PasswordReset({ identifier: cleanIdentifier });
        await newResetRecord.save();
        return res.json({
            success: true,
            message: "Password reset authorized successfully.",
            tempPassword: temporaryPassword 
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;