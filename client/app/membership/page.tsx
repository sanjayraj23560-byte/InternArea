'use client'

import { useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { auth } from '@/components/Firebase'
import { useLanguage } from '@/context/LanguageContext'
import { CalendarClock, CheckCircle2 } from 'lucide-react'

const isWithinPaymentWindow = (): boolean => {
    return true
    // const now = new Date()
    // const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
    // const hours = ist.getUTCHours()
    // const minutes = ist.getUTCMinutes()
    // const total = hours * 60 + minutes

    // const windowStart = 10 * 60;
    // const windowEnd = 11 * 60;  
    // return total >= windowStart && total < windowEnd
}

interface MembershipItem {
    tier: string
    planKey: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD'
    amount: number
    appLimit: number
    popular?: boolean
    label: string
    btnBg: string
    btnText: string
}

interface RazorpayOrderResponse {
    data: {
        id: string
        amount: number
        currency: string
    }
}

interface RazorpaySuccessResponse {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

interface CurrentSubscription {
    planName: 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD'
    planAmount: number
    startDate: string | null
    expiryDate: string | null
    limit: number
    applicationsUsed: number
    expired?: boolean
}

const membershipDetails: MembershipItem[] = [
    { tier: 'Free', planKey: 'FREE', amount: 0, appLimit: 1, label: 'Current Plan', btnBg: 'rgba(255,255,255,0.1)', btnText: '#fff' },
    { tier: 'Bronze', planKey: 'BRONZE', amount: 100, appLimit: 3, label: 'Upgrade Now', btnBg: '#c07838', btnText: '#fff3e0' },
    { tier: 'Silver', planKey: 'SILVER', amount: 300, appLimit: 5, popular: true, label: 'Go Premium', btnBg: '#4a6cf7', btnText: '#fff' },
    { tier: 'Gold', planKey: 'GOLD', amount: 1000, appLimit: -1, label: 'Unlock Elite', btnBg: '#c8980e', btnText: '#fffbe0' },
]

const gemColors: Record<string, { name: string; fill: string }> = {
    Free: { name: '#a0a0b0', fill: '#707080' },
    Bronze: { name: '#cd7f32', fill: '#cd7f32' },
    Silver: { name: '#adbdff', fill: '#4a6cf7' },
    Gold: { name: '#ffd700', fill: '#ffd700' },
}

const perksFallback: Record<string, string[]> = {
    Free: ['Apply to 1 internship/job per month', 'Community forum viewing privileges'],
    Bronze: ['Apply to 3 internships/jobs per month', 'View salary insights', 'Discord community entry'],
    Silver: ['Apply to 5 internships/jobs per month', 'Direct hiring team messaging routing', 'Verified candidate badge'],
    Gold: ['Unlimited internship/job applications', '1-on-1 resume feedback sessions', 'Featured top-profile exposure'],
}

const planKeyToTier: Record<string, string> = {
    FREE: 'Free',
    BRONZE: 'Bronze',
    SILVER: 'Silver',
    GOLD: 'Gold',
}

const MembershipCanvas = () => <div className="absolute inset-0 z-0 pointer-events-none" />
const GemIcon = ({ tier }: { tier: string }) => <span className="text-xl">💎</span>

export default function Membership() {
    const { t } = useLanguage()
    const router = useRouter()
    const [authLoading, setAuthLoading] = useState<boolean>(true)
    const [planLoading, setPlanLoading] = useState<boolean>(true)
    const [afterSub, setAfterSub] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [subscription, setSubscription] = useState<CurrentSubscription | null>(null)

    const PAYMENT_WINDOW_MESSAGE = t('membership.paymentWindowMessage') || 'Payments are only allowed between 8:00 AM – 10:00 PM IST'

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setAuthLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const fetchPlan = async () => {
        if (!user) return
        try {
            setPlanLoading(true)
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/plan/${user.uid}/plan`
            )
            if (res.status === 200 && res.data?.data) {
                setSubscription(res.data.data)
            }
        } catch (error) {
            console.log('Could not load subscription, defaulting to Free')
            setSubscription({
                planName: 'FREE',
                planAmount: 0,
                startDate: null,
                expiryDate: null,
                limit: 1,
                applicationsUsed: 0,
            })
        } finally {
            setPlanLoading(false)
        }
    }

    useEffect(() => {
        fetchPlan()
    }, [user])

    const initPayment = (orderData: RazorpayOrderResponse, planKey: MembershipItem['planKey']) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_API_KEY,
            amount: orderData.data.amount,
            currency: orderData.data.currency,
            order_id: orderData.data.id,
            description: 'Intern Area Membership',
            handler: async (response: RazorpaySuccessResponse) => {
                try {
                    const verification = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/sign`,
                        { response }
                    )
                    if (verification.status === 200) {
                        const uid = user?.uid
                        const currentUserName = user?.displayName

                        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/plan/${uid}`, {
                            planAmount: orderData.data.amount, // paise — backend converts to rupees
                            orderId: orderData.data.id,
                            paymentId: response.razorpay_payment_id,
                            email: user?.email,
                            userName: currentUserName,
                        })

                        toast.success(t('membership.membershipActivatedToast') || 'Membership Activated 🎉')
                        setAfterSub(true)
                        await fetchPlan()
                    }
                } catch (error) {
                    console.error('Verification error:', error)
                    toast.error(t('membership.paymentVerifyFailed') || 'Payment verification failed ❌')
                }
            },
            theme: {
                color: '#4a6cf7',
            },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
    }

    const handlePayment = async (index: number) => {
        if (!user) {
            toast.error(t('membership.pleaseLoginToast') || 'Please login first')
            router.push('/login')
            return
        }

        const plan = membershipDetails[index]

        if (plan.amount === 0) {
            toast.info(t('membership.alreadyFreeToast') || 'You are already on the Free Plan')
            return
        }

        if (!isWithinPaymentWindow()) {
            toast.error(PAYMENT_WINDOW_MESSAGE)
            return
        }

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/paymentreq`,
                { amount: plan.amount }
            )
            initPayment(data, plan.planKey)
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error(PAYMENT_WINDOW_MESSAGE)
            } else {
                toast.error(t('membership.paymentInitFailed') || 'Payment initiation failed')
            }
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
                <h1 className="text-white text-xl animate-pulse">
                    {t('membership.checkingAuth') || 'Checking authentication...'}
                </h1>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a] px-4">
                <h1 className="text-white text-4xl font-bold mb-4 text-center">
                    {t('membership.loginRequiredTitle') || 'Please Login First'}
                </h1>
                <p className="text-gray-400 mb-8 text-center max-w-sm">
                    {t('membership.loginRequiredMessage') || 'You need to login before accessing memberships.'}
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    {t('membership.loginBtn') || 'Login'}
                </button>
            </div>
        )
    }

    if (afterSub) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] px-4">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-green-400 mb-4">
                        {t('membership.activatedTitle') || 'Membership Activated 🎉'}
                    </h1>
                    <p className="text-gray-300 mb-8">
                        {t('membership.activatedMessage') || 'Your subscription has been successfully activated. Thank you!'}
                    </p>
                    <button
                        onClick={() => setAfterSub(false)}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                        {t('membership.viewMyPlan') || 'View My Plan'}
                    </button>
                </div>
            </div>
        )
    }

    if (planLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
                <h1 className="text-white text-xl animate-pulse">
                    {t('membership.loadingSubscription') || 'Loading your subscription...'}
                </h1>
            </div>
        )
    }

    const hasActivePlan = subscription && subscription.planName !== 'FREE' && !subscription.expired

    // ── Current Subscription Card (shown for any active paid plan) ──
    if (hasActivePlan && subscription) {
        const tierName = planKeyToTier[subscription.planName] || 'Free'
        const planKeyLower = subscription.planName.toLowerCase()
        const displayTierName = t(`membership.tiers.${planKeyLower}`) || tierName
        const theme = gemColors[tierName] || { name: '#fff', fill: '#4a6cf7' }
        const used = subscription.applicationsUsed ?? 0
        const limit = subscription.limit
        const isUnlimited = limit === -1
        const usagePct = isUnlimited ? 0 : Math.min(100, (used / Math.max(limit, 1)) * 100)
        const expiryLabel = subscription.expiryDate
            ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
            : '—'
        const displayPerks = t(`membership.perks.${planKeyLower}`) as unknown as string[]

        return (
            <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a] flex items-center justify-center px-4">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(74,108,247,0.08) 0%, transparent 70%)',
                    }}
                />
                <div
                    className="relative z-10 w-full max-w-md rounded-3xl p-8 backdrop-blur-sm"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1.5px solid rgba(74,108,247,0.35)',
                    }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <span
                            className="text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
                        >
                            <CheckCircle2 size={12} /> {t('membership.activeBadge') || 'Active'}
                        </span>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <GemIcon tier={tierName} />
                        </div>
                    </div>

                    <p className="text-sm font-semibold tracking-wide mb-1" style={{ color: theme.name }}>
                        {displayTierName} {t('membership.planSuffix') || 'Plan'}
                    </p>
                    <h1 className="text-3xl font-bold text-[#e8eeff] mb-1">
                        ₹{subscription.planAmount}
                        <span className="text-sm font-normal ml-1" style={{ color: '#5050a0' }}>{t('membership.perMonth') || '/mo'}</span>
                    </h1>

                    <div className="flex items-center gap-2 mt-4 mb-5 text-sm" style={{ color: '#9aa0c8' }}>
                        <CalendarClock size={15} />
                        <span>{t('membership.renewsExpires') || 'Renews / expires on'} <span className="text-[#e8eeff] font-medium">{expiryLabel}</span></span>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1.5" style={{ color: '#7080a8' }}>
                            <span>{t('membership.appsUsedThisCycle') || 'Applications used this cycle'}</span>
                            <span className="font-medium" style={{ color: '#e8eeff' }}>
                                {used} / {isUnlimited ? '∞' : limit}
                            </span>
                        </div>
                        {!isUnlimited && (
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${usagePct}%`, background: theme.fill }}
                                />
                            </div>
                        )}
                    </div>

                    <ul className="flex flex-col gap-2.5 mb-6">
                        {(Array.isArray(displayPerks) ? displayPerks : []).map((perk) => (
                            <li key={perk} className="flex items-start gap-2 text-xs" style={{ color: '#7080a8' }}>
                                <span className="mt-0.5 shrink-0" style={{ color: theme.fill, fontSize: 10 }}>✦</span>
                                <span>{perk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }

    // ── Pricing Grid (Free tier or expired plan) ──
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a]">
            <MembershipCanvas />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(rgba(180,190,230,0.07) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(74,108,247,0.07) 0%, transparent 70%)',
                }}
            />

            <main className="relative z-10 flex flex-col items-center pt-36 pb-24 px-4">
                <p className="text-xs font-medium tracking-widest text-[#4a6cf7] mb-3 uppercase">
                    {t('membership.membershipLabel') || 'Membership'}
                </p>
                <h1 className="text-4xl font-semibold text-[#f0eeff] mb-3 tracking-tight text-center">
                    {t('membership.choosePlan') || 'Choose your plan'}
                </h1>
                <p className="text-[#6060a0] text-sm mb-14 text-center">
                    {t('membership.subtitle') || 'Unlock more opportunities with a premium membership'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    {membershipDetails.map((item, index) => {
                        const theme = gemColors[item.tier] || { name: '#fff', fill: '#4a6cf7' }
                        const isCurrentFree = item.planKey === 'FREE' && (!subscription || subscription.planName === 'FREE')
                        const planKeyLower = item.planKey.toLowerCase()
                        const displayTierName = t(`membership.tiers.${planKeyLower}`) || item.tier
                        const displayLabel = isCurrentFree
                            ? (t('membership.currentPlanBtn') || 'Current Plan')
                            : (t(`membership.planLabels.${planKeyLower}`) || item.label)
                        const displayPerks = t(`membership.perks.${planKeyLower}`) as unknown as string[]

                        return (
                            <div
                                key={item.tier}
                                className="group relative flex flex-col items-center rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 backdrop-blur-sm"
                                style={{
                                    background: item.popular ? 'rgba(74,108,247,0.08)' : 'rgba(255,255,255,0.03)',
                                    border: item.popular
                                        ? '1.5px solid rgba(74,108,247,0.5)'
                                        : '0.5px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                {item.popular && (
                                    <span
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                                        style={{ background: '#4a6cf7', color: '#fff' }}
                                    >
                                        {t('membership.mostPopular') || 'Most popular'}
                                    </span>
                                )}

                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    <GemIcon tier={item.tier} />
                                </div>

                                <p className="text-sm font-semibold tracking-wide mb-1" style={{ color: theme.name }}>
                                    {displayTierName}
                                </p>

                                <div className="w-7 h-px mb-4 rounded" style={{ background: theme.fill, opacity: 0.5 }} />

                                <p className="text-2xl font-bold mb-2" style={{ color: '#e8eeff' }}>
                                    {item.amount === 0 ? (t('membership.tiers.free') || 'Free') : `₹${item.amount}`}
                                    {item.amount > 0 && (
                                        <span className="text-xs font-normal ml-1" style={{ color: '#5050a0' }}>{t('membership.perMonth') || '/mo'}</span>
                                    )}
                                </p>

                                <ul className="flex flex-col gap-2.5 my-5 w-full">
                                    {(Array.isArray(displayPerks) ? displayPerks : []).map((perk) => (
                                        <li key={perk} className="flex items-start gap-2 text-xs" style={{ color: '#7080a8' }}>
                                            <span className="mt-0.5 shrink-0" style={{ color: theme.fill, fontSize: 10 }}>✦</span>
                                            <span>{perk}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePayment(index)}
                                    disabled={isCurrentFree}
                                    className="mt-auto w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: item.btnBg, color: item.btnText }}
                                >
                                    {displayLabel}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}