const express = require('express')
const router = express.Router()
const job = require('../models/jobModel');
const jobModel = require('../models/jobModel');

router.post('/jobpost', async (req, res) => {
  try {

    const jobData = new job({
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

router.get('/getjob', async (req, res) => {
  const NewJobs = await jobModel.find()
  res.send(NewJobs)
})

module.exports = router