const express = require('express')
const router = express.Router()
const Application = require('../models/applicationsModel')

// ── 1. GET ALL APPLICATIONS (For Admin View) ──
// Path: GET https://internarea-kuao.onrender.comapi/job-applications/admin
router.get('/admin', async (req, res) => {
    try {
        // Fetch all user applications submitted across the platform
        const allApplications = await Application.find({}).sort({ createdAt: -1 });
        return res.status(200).json(allApplications);
    } catch (err) {
        console.error("Admin database fetch error:", err);
        return res.status(500).json({ Message: "Internal Server Error", error: err.message });
    }
});

// ── 2. GET USER SPECIFIC APPLICATIONS (Your existing route) ──
router.get('/', async (req, res) => {
    try {
        const userEmail = req.query.email;
        if (!userEmail) {
            return res.status(400).json({ Message: "User email parameter is required" });
        }
        const userApplications = await Application.find({ "user.email": userEmail }).sort({ createdAt: -1 });
        return res.status(200).json(userApplications);
    } catch (err) {
        console.error("Database fetch error:", err);
        return res.status(500).json({ Message: "Internal Server Error", error: err.message });
    }
});

// ── 3. UPDATE APPLICATION STATUS (Admin Accept / Reject Action) ──
// Path: PUT https://internarea-kuao.onrender.comapi/job-applications/:id/status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Expecting "Accepted" or "Rejected"

        if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ Message: "Invalid status value provided" });
        }

        // Find the application doc and update its status field dynamically
        const updatedApplication = await Application.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Returns the modified document instead of the original
        );

        if (!updatedApplication) {
            return res.status(404).json({ Message: "Application record not found" });
        }

        return res.status(200).json(updatedApplication);
    } catch (err) {
        console.error("Status update error:", err);
        return res.status(500).json({ Message: "Internal Server Error", error: err.message });
    }
});

// ── 4. POST NEW APPLICATION (Your existing route) ──
router.post('/', async (req, res) => {
    try {
        const newApplicationInstance = new Application({
            company: req.body.company,
            category: req.body.category,
            status: "Pending", // Ensure default state tracking is initialized
            user: {
                uid: req.body.user?.uid,
                email: req.body.user?.email
            },
            Application: {
                internshipId: req.body._id,
                title: req.body.title,
                location: req.body.location,
                stipend: req.body.stipend,
                duration: req.body.duration
            }
        });

        const savedApplication = await newApplicationInstance.save();
        return res.status(200).json(savedApplication);
    } catch (err) {
        console.error("Database save error:", err);
        return res.status(400).json({ Message: "Internal Error on server!", error: err.message });
    }
});

module.exports = router;