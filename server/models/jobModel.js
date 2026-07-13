import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    CTC: String,
    aboutCompany: String,
    aboutJob: String,
    whocanApply: String,
    perks: Array,
    noOfOpenings: String,
    startDate: String,
    additionalInformation: String,
    experience: String,
    category: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const JobModel = mongoose.model("jobData", jobSchema);

export default JobModel;