const express = require('express')
const router = express.Router()

// ── 1. Cleaned and Grouped Route Imports ──
const admin = require('./adminRouter.js')
const internship = require('./internshipRouter.js')
const job = require('./jobRouter.js')
const applications = require('./applicationsRouter.js') // Handles User & Admin applications

// ── 2. Route Endpoints Mount Configuration ──

// Admin Authorization Routes
router.use('/admin', admin)

// Internship Routes (Both Posting & Fetching)
router.use('/internship', internship)
router.use('/getintern', internship) // Matches your browsing page path structure

// Job Routes (Both Posting & Fetching)
router.use('/job', job)
router.use('/jobs', job) // Matches your Jobs page path structure

// Applications Routes (Handles Users, Admins, and Status updates)
router.use('/application', applications)
router.use('/job-applications', applications) // Aligns perfectly with the JobDetail path requests!

module.exports = router