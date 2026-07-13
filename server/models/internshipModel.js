import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    stipend: String,
    aboutCompany: String,
    aboutInternship: String,
    whocanApply: String,
    perks: Array,
    noOfOpenings: String,
    startDate: String,
    duration: String,
    category: String,
    additionalInformation: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const InternshipModel = mongoose.model(
    "internshipData",
    internshipSchema
);

export default InternshipModel;