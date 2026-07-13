import { Router } from "express";
import mongoose from "mongoose";
const router = Router();

import {
    checkApplicationLimit,
    incrementApplicationUsage,
} from "../utils/applicationLimit.js";

// ── Application schema (internship applications) ─────────────────────────
const applicationSchema = new mongoose.Schema(
    {
        Application: {
            internshipId: String,
            title: String,
            company: String,
            location: String,
            stipend: String,
            duration: String,
            category: String,
        },
        user: {
            uid: String,
            email: String,
        },
    },
    { timestamps: true }
);

const ApplicationModel =
    mongoose.models.Application || mongoose.model("Application", applicationSchema);

// ── Submit an internship application
router.post("/", async (req, res) => {
    try {
        const { user, _id, title, company, location, stipend, duration, category } = req.body;

        if (!user?.uid) {
            return res.status(400).json({ message: "User is required" });
        }

        const { allowed, plan, limit, used, subscriptionId } = await checkApplicationLimit(user.uid);

        if (!allowed) {
            return res.status(403).json({
                message: `You've reached your ${plan} plan limit of ${limit} application${limit === 1 ? "" : "s"} this month. Upgrade your plan to apply for more.`,
                plan,
                limit,
                used,
            });
        }

        const application = await ApplicationModel.create({
            Application: {
                internshipId: _id,
                title,
                company,
                location,
                stipend,
                duration,
                category,
            },
            user: { uid: user.uid, email: user.email },
        });

        await incrementApplicationUsage(subscriptionId);

        return res.status(201).json({ success: true, data: application });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ── Get all applications for a given email ────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const applications = await ApplicationModel.find({ "user.email": email });
        return res.status(200).json(applications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;