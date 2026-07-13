import express from 'express';
import { Router } from 'express';
const router = Router();

router.post('/:activeCommentPostId', (req, res) => {
    try {
        const data = req.body.activeCommentPostId
        console.log(data)
        res.status(200).json({ message: "Data recived to server" })
    } catch (error) {
        res.status(500).json({ message: "Unhandeled server error" })
    }
})

export default router