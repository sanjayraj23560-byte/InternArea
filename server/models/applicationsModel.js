const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    coverLetter: String,
    company: String,
    category: String,
    user: Object,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Pending", "Rejected", "Approved"],
        default: "Pending"
    },
    Application: Object
});
const applicationModel = mongoose.model("ApplicationData", applicationSchema);

module.exports = applicationModel;