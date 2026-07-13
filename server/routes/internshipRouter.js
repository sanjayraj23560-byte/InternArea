import express from "express";
import InternshipModel from "../models/internshipModel.js";

const router = express.Router();

router.post("/internship", async (req, res) => {
    try {
        const internshipData = new InternshipModel({
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            stipend: req.body.stipend,
            aboutCompany: req.body.aboutCompany,
            aboutInternship: req.body.aboutInternship,
            whocanApply: req.body.whocanApply,
            perks: req.body.perks,
            noOfOpenings: req.body.noOfOpenings,
            startDate: req.body.startDate,
            duration: req.body.duration,
            category: req.body.category,
            additionalInformation: req.body.additionalInformation,
        });

        const saved = await internshipData.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get("/getInternhsips", async (req, res) => {
    try {
        const internships = await InternshipModel.find();
        res.status(200).json(internships);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;