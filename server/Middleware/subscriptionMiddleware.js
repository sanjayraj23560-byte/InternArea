import userModel from "../models/userModel";
import express from 'express';
export const checkExpiry = async (req, res, next) => {
    const user = await userModel.findById(req.params.uid);
    if (!user) {
        res.status(400).json({ message: "User not found !" });
    }
    if (
        user.subscription.expiryDate && new Date() > user.subscription.expiryDate
    ) {
        user.subscription.plan = "FREE";
        user.subscription.expiryDate = null;
        user.subscription.limit = 1;
        await user.save();
    }
    next();
};