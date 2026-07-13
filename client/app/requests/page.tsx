'use client'
import React, { useEffect, useState } from 'react'
import { auth } from "../../components/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import PendingRequests from "../../components/pendingRequests";
import { Inbox, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext"; // 🌍 1. Import translation hook

export default function RequestsPage() {
    const { t } = useLanguage(); // 🌍 2. Initialize localized string context lookup
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
    const [hasRequests, setHasRequests] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setCurrentUserId(u?.uid);
        });
        return () => unsub();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 pt-44 pb-16 space-y-6">
            {/* Header controls to head back home */}
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition text-gray-800"
            >
                <ArrowLeft size={14} /> {t('requests.backToDashboard') || "Back to Dashboard"}
            </button>

            {/* Conditionally render empty placeholder if the inner component counts 0 */}
            {!hasRequests ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto">
                    <div className="p-4 bg-gray-50 text-gray-400 rounded-full">
                        <Inbox size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {t('requests.inboxClearTitle') || "Your Inbox is Clear"}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-sm leading-relaxed">
                            {t('requests.inboxClearSubtitle') || "You don't have any incoming engage invitations right now. Connect with peers on the feed to expand your network!"}
                        </p>
                    </div>
                </div>
            ) : (
                <PendingRequests
                    currentUserId={currentUserId}
                    onCountChange={(count) => setHasRequests(count > 0)}
                />
            )}
        </div>
    );
}