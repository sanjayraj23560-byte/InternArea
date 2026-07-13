import express from "express";
import JobModel from "../models/jobModel.js";

const router = express.Router();

router.post("/jobpost", async (req, res) => {
  try {
    const jobData = new JobModel({
      title: req.body.title,
      company: req.body.company,
      location: req.body.place,
      CTC: req.body.CTC,
      aboutJob: req.body.description,
      experience: req.body.Experience,
      category: req.body.category || "General",
    });

    await jobData.save();

    return res.status(201).json({
      message: "Successfully added the data",
      data: jobData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal error with server",
      error: err.message,
    });
  }
});

router.get("/getjob", async (req, res) => {
  try {
    const jobs = await JobModel.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;