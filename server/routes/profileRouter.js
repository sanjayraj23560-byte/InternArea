import { Router } from "express";
import Profile from "../models/profileModel.js";

const router = Router();

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
            { uid },
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
            },
            {
                new: true, 
                upsert: true, 
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        res.status(200).json({ data: profile });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to save profile" });
    }
});

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