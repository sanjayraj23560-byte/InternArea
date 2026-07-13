import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: {
            type: String, // Firebase UID
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        profilePicture: {
            type: String,
            default: "",
        },

        subscription: {
            plan: {
                type: String,
                enum: ["FREE", "BASIC", "PREMIUM", "PRO"],
                default: "FREE",
            },

            limit: {
                type: Number,
                default: 1,
            },

            startDate: {
                type: Date,
                default: Date.now,
            },

            expiryDate: {
                type: Date,
                default: null,
            },
        },
    },
    {
        timestamps:
            true
    },

);

export default mongoose.model("User", UserSchema);