const express = require('express')
const router = express.Router()
const Application = require('../models/applicationsModel')

router.get('/', async (req, res) => {
    try {
        const { email } = req.query
        if (!email) return res.status(400).json({ message: "Email required" })
        const apps = await Application.find({ "user.email": email }).sort({ createdAt: -1 })
        res.status(200).json(apps)
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const newApp = new Application({
            company: req.body.company,
            category: req.body.category,
            user: {
                uid: req.body.user?.uid,
                email: req.body.user?.email
            },
            Application: {
                internshipId: req.body._id,    
                title: req.body.title,
                location: req.body.location,
                stipend: req.body.salary,     
                duration: req.body.experience 
            }
        })
        const saved = await newApp.save()
        res.status(200).json(saved)
    } catch (err) {
        res.status(400).json({ message: "Server error", error: err.message })
    }
})

module.exports = router