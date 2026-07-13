import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Failed");
    console.log(err.message);
  }
};

export default connectDB;