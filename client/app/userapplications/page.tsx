'use client'
import React, { useEffect, useState } from "react";
import { auth, provider } from "../../components/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import {
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Clock,
    MapPin,
    IndianRupee,
    CheckCircle2,
    Hourglass,
    XCircle,
    Loader2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DBApplication {
    _id: string;
    company: string;
    category: string;
    status: string;
    createdAt: string;
    Application?: {
        internshipId: string;
        title: string;
        location: string;
        stipend: string;
        duration: string;
    };
}

// Maps the app's language code to an Intl locale for date formatting
const DATE_LOCALES: Record<string, string> = {
    en: "en-IN",
    es: "es-ES",
    hi: "hi-IN",
    pt: "pt-PT",
    zh: "zh-CN",
    fr: "fr-FR",
};

// Backend statuses are fixed strings ("Approved", "Pending", etc.) — this
// maps them to a translation key so the displayed label follows the
// selected language, while getStatusStyle/getStatusIcon (unchanged) still
// key off the raw backend string.
const STATUS_KEY_MAP: Record<string, string> = {
    Approved: "approved",
    Shortlisted: "shortlisted",
    Rejected: "rejected",
    Pending: "pending",
    "Under Review": "underReview",
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case "Approved":
        case "Shortlisted":
            return "bg-green-100 text-green-700 border-green-200";
        case "Rejected":
            return "bg-red-100 text-red-700 border-red-200";
        case "Pending":
        case "Under Review":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "Approved":
        case "Shortlisted":
            return <CheckCircle2 size={16} />;
        case "Rejected":
            return <XCircle size={16} />;
        case "Pending":
        case "Under Review":
            return <Hourglass size={16} />;
        default:
            return <BriefcaseBusiness size={16} />;
    }
};

function User_Application() {
    const { t, language } = useLanguage();
    const [applications, setApplications] = useState<DBApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Translates a raw backend status string, falling back to the raw
    // string itself if there's no mapping/translation for it
    const getStatusLabel = (status: string) => {
        const key = STATUS_KEY_MAP[status];
        if (!key) return status;
        return t(`myApplications.statusLabels.${key}`) || status;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const fetchApplications = async () => {
            if (!user?.email) return;
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/application?email=${user.email}`);
                setApplications(response.data);
            } catch (error) {
                console.error("Error pulling application entries:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchApplications();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium">{t('myApplications.loading') || "Loading your applications..."}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-sm">
                    <BriefcaseBusiness className="mx-auto text-slate-400 mb-4" size={40} />
                    <h2 className="text-xl font-bold text-slate-900">{t('myApplications.accessDeniedTitle') || "Access Denied"}</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        {t('myApplications.accessDeniedMessage') || "Please log in with your account credentials to monitor your active internship and job applications."}
                    </p>
                </div>
            </div>
        );
    }

    const greeting = (t('myApplications.greeting') || "Hello, {email}! Track your selection status updates right here.")
        .replace("{email}", user.email);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-20 md:mt-10 sm:mt-40 max-xl:mt-40">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                        {t('myApplications.dashboardLabel') || "My Dashboard"}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        {t('myApplications.title') || "Applied Jobs & Internships"}
                    </h1>
                    <p className="mt-2 text-slate-500">{greeting}</p>
                </div>

                {/* Dashboard Metrics */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{t('myApplications.totalApplications') || "Total Applications"}</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                            {applications.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{t('myApplications.internships') || "Internships"}</p>
                        <h2 className="mt-2 text-3xl font-bold text-blue-600">
                            {applications.filter((app) => app.category !== "MBA" && app.category !== "Media").length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">{t('myApplications.jobsAlternate') || "Jobs / Alternate Roles"}</p>
                        <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                            {applications.filter((app) => app.category === "MBA" || app.category === "Media").length}
                        </h2>
                    </div>
                </div>

                {/* Applications Grid Display */}
                {applications.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                        {t('myApplications.noApplications') || "No applications submitted yet."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {applications.map((app) => (
                            <div
                                key={app._id}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-600 uppercase tracking-wider">
                                            {app.category || t('myApplications.categoryFallback') || "Internship"}
                                        </span>

                                        <h2 className="mt-3 text-xl font-bold text-slate-900">
                                            {app.Application?.title || t('myApplications.roleTitleFallback') || "Role Title"}
                                        </h2>
                                    </div>

                                    <span
                                        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                            app.status
                                        )}`}
                                    >
                                        {getStatusIcon(app.status)}
                                        {getStatusLabel(app.status)}
                                    </span>
                                </div>

                                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={17} className="text-slate-400" />
                                        {app.company}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin size={17} className="text-slate-400" />
                                        {app.Application?.location || t('myApplications.locationFallback') || "Not specified"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <IndianRupee size={17} className="text-slate-400" />
                                        {app.Application?.stipend || t('myApplications.stipendFallback') || "Unpaid / Negotiable"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={17} className="text-slate-400" />
                                        {t('myApplications.appliedLabel') || "Applied"}: {new Date(app.createdAt).toLocaleDateString(DATE_LOCALES[language] || "en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-400 font-mono">
                                        {t('myApplications.idLabel') || "ID"}: {app._id.slice(-6).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default User_Application;