const PLAN_ORDER = ['free', 'basic', 'pro', 'premium'];

const PLAN_SCAN_LIMITS = {
    free: 1,
    basic: 5,
    pro: 8,
    premium: 20
};

const hasRequiredPlan = (currentPlan = 'free', requiredPlan = 'free') => {
    const currentIdx = PLAN_ORDER.indexOf(currentPlan);
    const requiredIdx = PLAN_ORDER.indexOf(requiredPlan);
    if (currentIdx === -1 || requiredIdx === -1) return false;
    return currentIdx >= requiredIdx;
};

module.exports = {
    PLAN_ORDER,
    PLAN_SCAN_LIMITS,
    hasRequiredPlan
};
