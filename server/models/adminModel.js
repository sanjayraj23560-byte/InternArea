import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({});

const AdminModel = mongoose.model("adminData", adminSchema);

export default AdminModel;