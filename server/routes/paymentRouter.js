import dotenv from "dotenv";
dotenv.config();
import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Router } from "express";
const router = Router();
import UserModel from "../models/userModel.js";
import subscriptionModel from "../models/subscriptionDetialsModel.js";
import { PLAN_CONFIG, amountToPlan } from "../config/plans.js";
import { isWithinPaymentWindow } from "../utils/PaymentWindow.js";
import { sendEmail } from "../utils/mailer.js";

const PAYMENT_WINDOW_MESSAGE = "Payments are only allowed between 10:00 AM – 11:00 AM IST";

router.post("/", async (req, res) => {
    try {
        if (!req.body.amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        if (!isWithinPaymentWindow()) {
            return res.status(403).json({ message: PAYMENT_WINDOW_MESSAGE });
        }

        const paymentInstance = new Razorpay({
            key_id: process.env.RAZORPAY_TEST_API_KEY,
            key_secret: process.env.RZORPAY_TEST_API_SECRET,
        });

        const option = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };

        const data = await paymentInstance.orders.create(option);
        return res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/sign", (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            req.body.response;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RZORPAY_TEST_API_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            return res.status(200).send("Success");
        }
        return res.status(400).send("Invalid signature");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error !");
    }
});

router.post("/:uid", async (req, res) => {
    try {
        if (!isWithinPaymentWindow()) {
            return res.status(403).json({ message: PAYMENT_WINDOW_MESSAGE });
        }
        const userId = req.params.uid;
        const { planAmount, orderId, paymentId, email, userName } = req.body;

        const rupeeAmount = Math.round((planAmount || 0) / 100);
        const selectedPlan = amountToPlan(rupeeAmount);
        const planLimit = PLAN_CONFIG[selectedPlan].limit;

        const startDate = new Date();
        const expiryDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const subscription = await subscriptionModel.create({
            userId,
            planName: selectedPlan,
            planAmount: rupeeAmount,
            orderId,
            paymentId,
            startDate,
            expiryDate,
            applicationsUsed: 0,
        });

        await UserModel.findByIdAndUpdate(userId, {
            subscription: {
                plan: selectedPlan,
                limit: planLimit,
                startDate,
                expiryDate,
            },
        });

        if (email) {
            sendEmail(
                email,
                "Payment Successful 🎉",
                `
        <h2>Invoice</h2>
        <p>Name: Hey ${userName || "there"}</p>
        <p>Plan: ${selectedPlan}</p>
        <p>Amount: ${rupeeAmount}.00 ₹</p>
        <p>Payment ID: ${paymentId}</p>
        <p>Date: ${startDate.toLocaleDateString()}</p>
        <p>Expiry: ${expiryDate.toLocaleDateString()}</p>
        <hr>
        <p>Thank you for your purchase.</p>
        `
            ).then((sent) => {
                if (!sent) console.log("Mail not sent");
            });
        }

        return res.status(200).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/:uid/plan", async (req, res) => {
    try {
        const uid = req.params.uid;

        const sub = await subscriptionModel
            .findOne({ userId: uid })
            .sort({ createdAt: -1, startDate: -1 });

        if (!sub) {
            return res.status(200).json({
                data: {
                    planName: "FREE",
                    planAmount: 0,
                    startDate: null,
                    expiryDate: null,
                    limit: PLAN_CONFIG.FREE.limit,
                    applicationsUsed: 0,
                    expired: false,
                },
            });
        }

        const now = new Date();
        const isExpired = sub.expiryDate && now > new Date(sub.expiryDate);
        const effectivePlan = isExpired ? "FREE" : sub.planName;

        return res.status(200).json({
            data: {
                planName: effectivePlan,
                planAmount: isExpired ? 0 : sub.planAmount,
                startDate: sub.startDate,
                expiryDate: sub.expiryDate,
                limit: PLAN_CONFIG[effectivePlan]?.limit ?? 1,
                applicationsUsed: isExpired ? 0 : sub.applicationsUsed || 0,
                expired: isExpired,
            },
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Currently server is busy, try again later!" });
    }
});

export default router;