import express from 'express';
import UserModel from '../models/userModel.js';

const router = express.Router();
router.post('/sync-user', async (req, res) => {
    const { uid, name, email, profilePicture } = req.body;

    if (!uid || !name || !email) {
        return res.status(400).json({ message: "Missing required identification metadata parameters." });
    }
    try {

        const user = await UserModel.findOneAndUpdate(
            { _id: uid },
            {
                _id: uid,
                name: name,
                email: email.toLowerCase(),
                profilePicture: profilePicture || ""
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ message: "User synced to database successfully!", user });
    } catch (error) {
        res.status(500).json({ message: "Database syncing error", error: error.message });
    }
});

router.get('/me', async (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.status(400).json({ message: "User uid query parameter missing." });
    }

    try {
        const user = await UserModel.findById(uid);
        if (!user) {
            return res.status(404).json({ message: "User profile data record not found in MongoDB." });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: "Server login operation error", error: error.message });
    }
});

export default router;