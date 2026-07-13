import mongoose from "mongoose";
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
        expire: 0
    }
})

const OTP = mongoose.model("OTP", OTPSchema)

export default OTP