import express from 'express';
import { Router } from 'express';
import nodemailer from "nodemailer";
import OTP from '../models/OTPModel.js';
import subscriptionDetialsModel from '../models/subscriptionDetialsModel.js';

const router = Router();

async function getActivePlan(uid) {
    const sub = await subscriptionDetialsModel
        .findOne({ userId: uid })
        .sort({ createdAt: -1, startDate: -1 });

    if (!sub) return { isPremium: false, sub: null };

    const now = new Date();
    const isExpired = sub.expiryDate && now > new Date(sub.expiryDate);

    // A non-expired FREE-tier cycle should never count as premium, only a real paid plan does.
    const isPaidPlan = sub.planName && sub.planName !== 'FREE';

    return { isPremium: isPaidPlan && !isExpired, sub };
}

router.get('/status', async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) {
            return res.status(400).json({ message: "uid is required" });
        }

        const { isPremium } = await getActivePlan(uid);
        return res.status(200).json({ isPremium });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to check subscription status" });
    }
});

router.post('/post', async (req, res) => {
    try {
        const { uid, user: email } = req.body;

        const { isPremium } = await getActivePlan(uid);
        if (!isPremium) {
            return res.status(403).json({ message: "Please subscribe to a plan first" });
        }
        const oneTimePass = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email });
        const expireAt = new Date(Date.now() + 2 * 60 * 1000);
        await OTP.create({ email, otp: oneTimePass, expireAt });
        await sendEmail(
            email,
            "Resume Creation OTP",
            `<div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #1a56db;">OTP from — Intern Area</h2>
                <p>Your resume creation verification code is:</p>
                <h1 style="letter-spacing: 2px; color: #111827;">${oneTimePass}</h1>
                <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />
                <p style="color:#6b7280; font-size:13px;">Thank you for choosing Intern Area. Good luck with your applications! 🚀</p>
            </div>`
        );

        return res.status(201).json({ message: "otp success" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
});
router.post('/', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(404).json({ message: "OTP doesn't exist, try again" });
        }

        if (otpRecord.expireAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired, try resend to verify" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: "OTP unmatched!" });
        }
        await OTP.deleteOne({ email });
        return res.status(201).json({ message: "verified" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    dns: {
        family: 4 
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Intern Area" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent successfully:", info.messageId);
        return true;
    } catch (error) {
        console.error("Nodemailer Async Delivery Failure Exception:", error.message);
        return false;
    }
};

export default router;