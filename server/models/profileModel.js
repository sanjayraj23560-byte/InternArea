import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    duration: {
        type: String,
        default: ""
    },
    desc: {
        type: String,
        default: ""
    }
}, {
    _id: false
})

const educationSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true
        },
        degree: {
            type: String,
            default: ""
        },
        school: {
            type: String,
            default: ""
        },
        year: {
            type: String,
            default: ""
        },
        grade: {
            type: String,
            default: ""
        }
    },
    { _id: false }
)

const projectSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ""
    },
    desc: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    }
}, {
    _id: false
})


const profileSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    location: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    skills: {
        type: [String],
        default: []
    },
    experiences: {
        type: [experienceSchema],
        default: []
    },
    educations: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certs: [{ type: String, default: [] }],
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;