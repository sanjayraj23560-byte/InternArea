import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://internarea:internarea@cluster0.7uqxnrv.mongodb.net/internarea");
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Failed");
    console.log(err.message);
  }
};

export default connectDB;