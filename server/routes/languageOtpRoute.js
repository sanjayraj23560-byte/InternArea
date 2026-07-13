import { Router } from "express";
import LanguageOTP from "../models/languageOtpModel.js";
import { sendEmail } from "./resumeRouter.js"; // 🌍 Imports the updated IPv4 utility function cleanly

const router = Router();

// ── Send an OTP to verify a language switch (currently only required for French) ──
router.post("/send", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        // Generate clean 6-digit verification code string token
        const oneTimePass = Math.floor(100000 + Math.random() * 900000).toString();

        // Evict any stale pre-existing language shift requests for this user entry
        await LanguageOTP.deleteMany({ email });

        // Enforce a strict 2-minute expiration life cycle pool window
        const expireAt = new Date(Date.now() + 2 * 60 * 1000);
        await LanguageOTP.create({ email, otp: oneTimePass, expireAt });

        // Dispatch verification payload asynchronously
        await sendEmail(
            email,
            "Confirm Your Language Change",
            `<div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #1a56db;">Intern Area</h2>
                <p>Use this code to confirm switching your app language to French:</p>
                <h1 style="letter-spacing: 2px; color: #111827;">${oneTimePass}</h1>
                <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />
                <p style="color:#6b7280; font-size:13px;">This code expires in 2 minutes. If you didn't request this, you can ignore this email.</p>
            </div>`
        );

        // Always return success status gracefully to keep frontend operational
        return res.status(201).json({ message: "otp sent" });
    } catch (error) {
        console.error("Language OTP Route Error:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
});

// ── Verify the OTP before actually applying the language switch ──
router.post("/verify", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "email and otp are required" });
        }

        const record = await LanguageOTP.findOne({ email });

        if (!record) {
            return res.status(404).json({ message: "No OTP request found, please resend" });
        }

        if (record.expireAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired, please resend" });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        // Clean up database storage token right after validation succeeds
        await LanguageOTP.deleteOne({ email });
        return res.status(200).json({ verified: true });
    } catch (error) {
        console.error("Language OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;