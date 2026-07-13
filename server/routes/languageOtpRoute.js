import { Router } from "express";
import LanguageOTP from "../models/languageOtpModel.js";
import { sendEmail } from "./resumeRouter.js";

const router = Router();

// ── Send an OTP to verify a language switch (currently only required for French) ──
router.post("/send", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        const oneTimePass = Math.floor(100000 + Math.random() * 900000).toString();

        await LanguageOTP.deleteMany({ email });

        const expireAt = new Date(Date.now() + 2 * 60 * 1000);
        await LanguageOTP.create({ email, otp: oneTimePass, expireAt });

        await sendEmail(
            email,
            "Confirm Your Language Change",
            `<div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #1a56db;">Intern Area</h2>
                <p>Use this code to confirm switching your app language to French:</p>
                <h1>${oneTimePass}</h1>
                <hr style="margin: 16px 0;" />
                <p style="color:#6b7280; font-size:13px;">This code expires in 2 minutes. If you didn't request this, you can ignore this email.</p>
            </div>`
        );

        res.status(201).json({ message: "otp sent" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to send OTP" });
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

        await LanguageOTP.deleteOne({ email });
        return res.status(200).json({ verified: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;