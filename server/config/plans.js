// Single source of truth for plan pricing + monthly application limits.
// amount is in RUPEES (not paise). limit is "applications allowed per month".
// limit === -1 means unlimited.
export const PLAN_CONFIG = {
    FREE: { amount: 0, limit: 1 },
    BRONZE: { amount: 100, limit: 3 },
    SILVER: { amount: 300, limit: 5 },
    GOLD: { amount: 1000, limit: -1 },
};

// Reverse lookup: rupee amount -> plan name (defaults to FREE if no match)
export const amountToPlan = (amountInRupees) => {
    const match = Object.entries(PLAN_CONFIG).find(
        ([, cfg]) => cfg.amount === amountInRupees
    );
    return match ? match[0] : "FREE";
};