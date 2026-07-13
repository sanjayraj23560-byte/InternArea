import Profile from "../models/profileModel.js";

export const saveProfile = async (req, res) => {
    try {
        const { uid, ...data } = req.body;

        if (!uid) return res.status(400).json({ message: "UID is required" });

        const profile = await Profile.findOneAndUpdate(
            { uid },
            { uid, ...data },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Profile saved", profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { uid } = req.params;
        const profile = await Profile.findOne({ uid });

        if (!profile) return res.status(404).json({ message: "Profile not found" });

        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};