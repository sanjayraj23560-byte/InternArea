import { Router } from "express";
import LoginHistory from "../models/loginHistoryModel.js";
import LoginOTP from "../models/loginOtpModel.js";
import { sendEmail } from "./resumeRouter.js"; 
import { parseDeviceInfo } from "../utils/deviceParser.js";
import { getClientIp } from "../utils/getClientIp.js";

const router = Router();

function isWithinMobileWindow() {
    const now = new Date();
    const istTime = now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    });
    const [hourStr, minuteStr] = istTime.split(":");
    const minutesSinceMidnight = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
    return minutesSinceMidnight >= 10 * 60 && minutesSinceMidnight < 13 * 60; 
}
router.post("/check", async (req, res) => {
    try {
        const { uid, email } = req.body;
        if (!uid || !email) {
            return res.status(400).json({ message: "uid and email are required" });
        }

        const userAgent = req.headers["user-agent"] || "";
        const ip = getClientIp(req);
        const { browser, os, deviceType } = parseDeviceInfo(userAgent);
        if (deviceType === "Mobile" && !isWithinMobileWindow()) {
            const entry = await LoginHistory.create({
                uid,
                email,
                browser,
                os,
                deviceType,
                ip,
                status: "Blocked - Outside Hours",
                reason: "Mobile logins are only allowed between 10:00 AM and 1:00 PM IST",
            });

            return res.status(403).json({
                allowed: false,
                otpRequired: false,
                loginAttemptId: entry._id,
                message: "Mobile logins are only allowed between 10:00 AM and 1:00 PM IST. Please try again during that window.",
            });
        }

        if (browser === "Chrome") {
            const oneTimePass = Math.floor(100000 + Math.random() * 900000).toString();

            await LoginOTP.deleteMany({ email });
            const expireAt = new Date(Date.now() + 2 * 60 * 1000);
            await LoginOTP.create({ email, otp: oneTimePass, expireAt });

            await sendEmail(
                email,
                "Confirm Your Login",
                `<div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #1a56db;">Intern Area</h2>
                    <p>We noticed a login from Google Chrome. Use this code to confirm it's you:</p>
                    <h1>${oneTimePass}</h1>
                    <hr style="margin: 16px 0;" />
                    <p style="color:#6b7280; font-size:13px;">This code expires in 2 minutes. If this wasn't you, please secure your account.</p>
                </div>`
            );

            const entry = await LoginHistory.create({
                uid,
                email,
                browser,
                os,
                deviceType,
                ip,
                status: "OTP Sent",
                reason: "Chrome login requires OTP verification",
            });

            return res.status(200).json({
                allowed: false,
                otpRequired: true,
                loginAttemptId: entry._id,
                message: "Verification code sent to your email",
            });
        }

        // Neither restriction applies — log a successful attempt right away
        const entry = await LoginHistory.create({
            uid,
            email,
            browser,
            os,
            deviceType,
            ip,
            status: "Success",
        });

        return res.status(200).json({ allowed: true, otpRequired: false, loginAttemptId: entry._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to process login check" });
    }
});

// ── STEP 2: only called when /check responded with otpRequired: true ─────
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp, loginAttemptId } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "email and otp are required" });
        }

        const record = await LoginOTP.findOne({ email });
        if (!record) {
            return res.status(404).json({ message: "No OTP request found, please try logging in again" });
        }
        if (record.expireAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired, please try logging in again" });
        }
        if (record.otp !== otp) {
            if (loginAttemptId) {
                await LoginHistory.findByIdAndUpdate(loginAttemptId, { status: "OTP Failed" });
            }
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        await LoginOTP.deleteOne({ email });
        if (loginAttemptId) {
            await LoginHistory.findByIdAndUpdate(loginAttemptId, { status: "OTP Verified" });
        }

        return res.status(200).json({ allowed: true, verified: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ── For displaying login history on the profile page ─────────────────────
router.get("/history", async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) {
            return res.status(400).json({ message: "uid is required" });
        }
        const history = await LoginHistory.find({ uid }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(history);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch login history" });
    }
});

export default router;