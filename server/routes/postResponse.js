import { Router } from 'express';
import communityModel from '../models/communityPostModel.js';

const router = Router();

router.post('/like/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const post = await communityModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.includes(userId);
        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id !== userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();

        res.status(200).json({
            liked: !alreadyLiked,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update like" });
    }
});

router.post('/comment/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, username, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await communityModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post.comments.push({
            user: userId,
            username: username || "Anonymous",
            text: text.trim(),
            createdAt: new Date()
        });
        await post.save();

        res.status(200).json({
            message: "Comment added",
            comments: post.comments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add comment" });
    }
});

router.post('/share/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await communityModel.findByIdAndUpdate(
            postId,
            { $inc: { shares: 1 } },
            { new: true }
        );
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ sharesCount: post.shares });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to share post" });
    }
});

export default router;