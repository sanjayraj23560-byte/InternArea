import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import 'dotenv/config'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import communityModel from '../models/communityPostModel.js';
import UserModel from '../models/userModel.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
router.post('/', upload.single('postFile'), async (req, res) => {
    try {
        const fileData = req.file;
        const captionText = req.body.caption;
        const authorId = req.body.authorId;

        // ─── EXTRACT THE NAME FROM REQ.BODY ───
        const authorNameText = req.body.authorName || "Community Member";

        if (!fileData) return res.status(400).json({ message: "No media file uploaded" });
        if (!authorId) return res.status(400).json({ message: "User identification missing" });

        const isVideo = fileData.mimetype.startsWith('video/');
        const mediaType = isVideo ? 'video' : 'image';

        const cloudinaryResponse = await cloudinary.uploader.upload(fileData.path, {
            resource_type: isVideo ? "video" : "image",
            folder: "internshala_public_space"
        });

        fs.unlinkSync(fileData.path);

        const newPost = new communityModel({
            caption: captionText,
            mediaUrl: cloudinaryResponse.secure_url,
            mediaType: mediaType,
            author: authorId,
            authorName: authorNameText // ─── SAVE IT INTO MONGODB HERE ───
        });
        // After extracting authorId and authorNameText, upsert the user into MongoDB
        await UserModel.findOneAndUpdate(
            { _id: authorId },
            {
                _id: authorId,
                name: authorNameText,
                email: req.body.authorEmail || "",
                profilePicture: req.body.authorPhoto || ""
            },
            { upsert: true, new: true }
        )
        await newPost.save();
        res.status(201).json({ message: "Post saved successfully!", post: newPost });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Backend error", error: error.message });
    }
});
router.get('/', async (req, res) => {
    try {
        // 1. Get page and limit from query strings, or set defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        // Calculate how many items to skip over to get to the requested chunk
        const skip = (page - 1) * limit;

        // 2. Count total documents in background (Crucial for frontend infinite scroll/pagination math)
        const totalPosts = await communityModel.countDocuments();

        // 3. Execute the paginated, populated database query
        const posts = await communityModel.find()
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)               // Skip previous pages' items
            .limit(limit)             // Pull only the current page's payload size
            .populate('author', 'name email profilePicture'); // Pull author info automatically from users collection

        // 4. Return structural metadata back along with the posts array
        res.status(200).json({
            success: true,
            pagination: {
                totalItems: totalPosts,
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                hasNextPage: skip + posts.length < totalPosts
            },
            count: posts.length,
            posts: posts
        });

    } catch (error) {
        console.error("Upgraded GET pipeline error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching community feed",
            error: error.message
        });
    }
});

router.get('/today-count', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json({ count: 0 });

    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const count = await communityModel.countDocuments({
            author: userId,
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all posts created by a specific user
router.get('/user-posts', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    try {
        const posts = await communityModel.find({ author: userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a post's caption (with ownership check validation)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { caption, userId } = req.body;

    try {
        const post = await communityModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Security check: Verify the editor matches the author field string
        if (post.author !== userId) {
            return res.status(403).json({ message: "Unauthorized adjustment block" });
        }

        post.caption = caption;
        await post.save();
        res.json({ message: "Description updated successfully!", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post (with ownership check validation)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    try {
        const post = await communityModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author !== userId) {
            return res.status(403).json({ message: "Unauthorized delete request restriction" });
        }

        await communityModel.findByIdAndDelete(id);
        res.json({ message: "Post deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
