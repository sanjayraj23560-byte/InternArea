import express from 'express'
import { Router } from 'express'
import aiResumeModel from '../models/aiResumeModel.js'
const router = Router()

router.post('/', async (req, res) => {
    try {
        const newFormatData = await aiResumeModel({
            name: req.body.formData.name,
            email: req.body.formData.email,
            phone: req.body.formData.phone,
            qualifications: req.body.formData.qualifications,
            experience: req.body.formData.experience,
        })

        const savedData = await newFormatData.save()
        res.status(200).json({ data: savedData })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to save resume" })
    }
})

router.post('/get-resume', async (req, res) => {
    try {
        const email = req.body.email
        const FetchedResume = await aiResumeModel.findOne({ email })

        if (!FetchedResume) {
            // Consistent JSON shape so the frontend can rely on res.data.FetchedResume
            return res.status(404).json({ message: "You don't have a resume yet, please build one" })
        }

        res.status(200).json({ FetchedResume })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to fetch resume" })
    }
})

export default router