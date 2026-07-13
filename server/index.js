import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import router from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});