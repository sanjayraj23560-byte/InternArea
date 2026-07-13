import express from 'express';
import Engage from '../models/engageModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// 1. Send or Cancel Request
router.post('/request', async (req, res) => {
    const { senderId, receiverId } = req.body;
    if (senderId === receiverId) return res.status(400).json({ error: "You cannot connect with yourself" });

    try {
        const existing = await Engage.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (existing) {
            if (existing.status === 'pending' && existing.senderId === senderId) {
                await Engage.findByIdAndDelete(existing._id);
                return res.json({ status: 'none', message: 'Request canceled' });
            }
            return res.status(400).json({ error: 'Relationship or request already exists' });
        }

        const newRequest = Engage({ senderId, receiverId, status: 'pending' });
        await newRequest.save();
        res.json({ status: 'pending', message: 'Request sent successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Accept Pending Request
router.post('/accept', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const record = await Engage.findOneAndUpdate(
            { senderId, receiverId, status: 'pending' },
            { status: 'accepted' },
            { returnDocument: 'after' } // ✅ Fixed deprecation warning
        );
        if (!record) return res.status(404).json({ error: 'Pending request not found' });
        res.json({ status: 'accepted', message: 'Connection accepted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Remove/Disconnect Connection
router.post('/remove', async (req, res) => {
    const { userA, userB } = req.body;
    try {
        await Engage.findOneAndDelete({
            $or: [
                { senderId: userA, receiverId: userB },
                { senderId: userB, receiverId: userA }
            ]
        });
        res.json({ status: 'none', message: 'Connection removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Check Current Connection Status
router.get('/status', async (req, res) => {
    const { senderId, receiverId } = req.query;
    try {
        const record = await Engage.findOne({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });

        if (!record) return res.json({ status: 'none' });
        if (record.status === 'pending') {
            return res.json({
                status: 'pending',
                isSender: record.senderId === senderId
            });
        }
        res.json({ status: 'accepted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Incoming Requests (Now with User Details! 🔥)
router.get('/incoming', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    try {
        const requests = await Engage.find({
            receiverId: userId,
            status: 'pending'
        }).lean();

        // Populate the sender profiles so the UI has pictures/names to render
        const formattedRequests = await Promise.all(requests.map(async (reqst) => {
            const senderProfile = await User.findOne({ uid: reqst.senderId }).lean();
            return {
                requestId: reqst._id,
                senderId: reqst.senderId,
                name: senderProfile?.name || "New Member",
                photo: senderProfile?.photo || "",
                createdAt: reqst.createdAt
            };
        }));

        res.json(formattedRequests);
    } catch (err) {
        console.error("Error fetching incoming requests:", err);
        res.status(500).json({ error: err.message });
    }
});

// 6. Get My Network List
router.get('/my-network', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    try {
        const connections = await Engage.find({
            status: 'accepted',
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).lean();

        const networkList = await Promise.all(connections.map(async (conn) => {
            const peerId = conn.senderId === userId ? conn.receiverId : conn.senderId;
            const peerProfile = await User.findOne({ uid: peerId }).lean();

            return {
                connectionId: conn._id,
                peerId,
                name: peerProfile?.name || "Connected Member",
                photo: peerProfile?.photo || "",
                connectedAt: conn.updatedAt
            };
        }));

        res.json(networkList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;