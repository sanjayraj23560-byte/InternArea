import subscriptionModel from "../models/subscriptionDetialsModel.js";
import { PLAN_CONFIG } from "../config/plans.js";

const FREE_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;
async function getOrCreateActiveCycle(userId) {
    let sub = await subscriptionModel
        .findOne({ userId })
        .sort({ createdAt: -1, startDate: -1 });

    const now = new Date();
    const isExpired = sub && sub.expiryDate && now > new Date(sub.expiryDate);

    if (!sub || isExpired) {
        const startDate = now;
        const expiryDate = new Date(now.getTime() + FREE_CYCLE_MS);
        sub = await subscriptionModel.create({
            userId,
            planName: "FREE",
            planAmount: 0,
            orderId: null,
            paymentId: null,
            startDate,
            expiryDate,
            applicationsUsed: 0,
        });
    }

    return sub;
}

export async function checkApplicationLimit(userId) {
    const sub = await getOrCreateActiveCycle(userId);

    const plan = sub.planName;
    const limit = PLAN_CONFIG[plan]?.limit ?? 1;
    const used = sub.applicationsUsed || 0;

    const allowed = limit === -1 ? true : used < limit;

    return { allowed, plan, limit, used, subscriptionId: sub._id };
}
export async function incrementApplicationUsage(subscriptionId) {
    if (!subscriptionId) return;
    await subscriptionModel.findByIdAndUpdate(subscriptionId, {
        $inc: { applicationsUsed: 1 },
    });
}