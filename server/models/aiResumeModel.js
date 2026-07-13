import mongoose from 'mongoose';
const aiResumeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    }
});

const aiResumeModel = mongoose.model("AIModel", aiResumeSchema);
export default aiResumeModel;