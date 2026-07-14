import { Router } from "express";
import mongoose from "mongoose";
const router = Router();

import {
  checkApplicationLimit,
  incrementApplicationUsage,
} from "../utils/applicationLimit.js";

// ── Job application schema ────────────────────────────────────────────────
const jobApplicationSchema = new mongoose.Schema(
  {
    Application: {
      internshipId: String, 
      title: String,        
      company: String,      
      location: String,
      salary: String,
      experience: String,
      category: String,
    },
    user: {
      uid: String,
      email: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const JobApplicationModel =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);

// ── Submit a job application ──────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { user, _id, title, company, location, salary, experience, category } = req.body;

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

    const application = await JobApplicationModel.create({
      Application: {
        internshipId: _id,
        title,
        company,
        location,
        salary,
        experience,
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

router.get("/admin", async (req, res) => {
  try {
    const applications = await JobApplicationModel.find().sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ── Update application status (Accept/Reject) ───────────────────────────────
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Accepted", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await JobApplicationModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ── Get all job applications for a given email ────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const applications = await JobApplicationModel.find({ "user.email": email });
    return res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;