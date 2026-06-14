const express = require('express')
const router = express.Router()
const internship = require('../models/internshipModel')
const internshipModel = require('../models/internshipModel')

router.post('/internship', async (req, res) => {
    const internshipData = new internship({
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

    })
    await internshipData.save().then((data) => {
        res.send(data)
    }).catch((err) => {
        console.log(err)
    })
})

router.get('/getInternhsips', async (req,res)=>{
    const NewInternships = await internshipModel.find()
    res.send(NewInternships)
})

module.exports = router