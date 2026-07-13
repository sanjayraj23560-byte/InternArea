import { Router } from "express";
import Profile from "../models/profileModel.js";

const router = Router();

// ── Save (create or update) a profile ─────────────────────────────────────
// Upserting on `uid` means this one route handles both the very first save
// (no profile exists yet) and every subsequent edit — no need for separate
// POST /create and PUT /update routes.
router.post("/info", async (req, res) => {
    try {
        const {
            uid,
            name,
            title,
            location,
            email,
            phone,
            website,
            bio,
            avatar,
            skills,
            experiences,
            educations,
            projects,
            certs,
        } = req.body;

        if (!uid) {
            return res.status(400).json({ message: "uid is required" });
        }

        const profile = await Profile.findOneAndUpdate(
            { uid }, // find by this
            {
                uid,
                name,
                title,
                location,
                email,
                phone,
                website,
                bio,
                avatar,
                skills,
                experiences,
                educations,
                projects,
                certs,
            }, // set these fields
            {
                new: true, // return the updated doc, not the pre-update one
                upsert: true, // create it if it doesn't exist yet
                runValidators: true, // still enforce schema rules (e.g. required email) on update
                setDefaultsOnInsert: true, // apply schema defaults on first creation
            }
        );

        res.status(200).json({ data: profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to save profile" });
    }
});

// ── Fetch a profile by uid ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) {
            return res.status(400).json({ message: "uid is required" });
        }

        const profile = await Profile.findOne({ uid });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.status(200).json({ data: profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

export default router;