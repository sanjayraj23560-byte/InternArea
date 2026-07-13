import express from "express";

const router = express.Router();

const adminname = "admin";
const adminpass = "admin";

router.post("/adminlogin", (req, res) => {
    const { username, password } = req.body;

    if (adminname === username && adminpass === password) {
        return res.send("success");
    }

    return res.status(400).json({ message: "Invalid credentials" });
});

export default router;