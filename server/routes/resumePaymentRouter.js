import express, { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import dotenv from 'dotenv'

const router = Router()

router.post('/', async (req, res) => {
    try {
        const paymentInstance = new Razorpay({
            key_id: process.env.RAZORPAY_TEST_API_KEY,
            key_secret: process.env.RZORPAY_TEST_API_SECRET
        })
        const option = {
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString('hex'),
        }

        const data = await paymentInstance.orders.create(option)
        res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to create payment order" })
    }
})

router.post('/verify', async (req, res) => {
    try {
        const { order_id, payment_id, signature, uid } = req.body;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RZORPAY_TEST_API_SECRET)
            .update(order_id + "|" + payment_id)
            .digest("hex")

        if (expectedSignature === signature) {
            return res.status(200).json({ message: "Payment verified" })
        }
        return res.status(400).json({ message: "Payment verification failed" })
    } catch (error) {
        console.log("After payment", error)
        res.status(500).json({ message: "Payment verification error" })
    }
})

export default router