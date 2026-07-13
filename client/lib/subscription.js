import subscriptionModel from "../models/subscriptionDetialsModel.js";
import { PLAN_CONFIG } from "../config/plans.js";

const FREE_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Returns the subscription doc that governs the user's CURRENT cycle.
 * If none exists yet, or the existing one has expired, a fresh FREE-tier
 * record is created so usage has somewhere to be counted.
 */
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

/**
 * Determines the user's active plan + how many applications they've used
 * this billing cycle, and whether they're still allowed to apply.
 *
 * Returns:
 *   { allowed: boolean, plan: string, limit: number, used: number, subscriptionId: string }
 */
export async function checkApplicationLimit(userId) {
    const sub = await getOrCreateActiveCycle(userId);

    const plan = sub.planName;
    const limit = PLAN_CONFIG[plan]?.limit ?? 1;
    const used = sub.applicationsUsed || 0;

    const allowed = limit === -1 ? true : used < limit;

    return { allowed, plan, limit, used, subscriptionId: sub._id };
}

/**
 * Increments the applications-used counter on the active subscription cycle.
 */
export async function incrementApplicationUsage(subscriptionId) {
    if (!subscriptionId) return;
    await subscriptionModel.findByIdAndUpdate(subscriptionId, {
        $inc: { applicationsUsed: 1 },
    });
}