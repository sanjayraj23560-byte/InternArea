'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, X, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/components/Firebase';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const OTP_GATED_LANGUAGES = ['fr']; // languages that require OTP verification to switch to

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const [user, setUser] = useState(null);

    // ── OTP verification state (only used when switching to a gated language) ──
    const [pendingLangCode, setPendingLangCode] = useState(null);
    const [otp, setOtp] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
        return () => unsub();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // OTP countdown, only runs while the OTP modal is open
    useEffect(() => {
        if (!pendingLangCode) return;
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, pendingLangCode]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const sendLanguageOtp = async (email) => {
        setSendingOtp(true);
        try {
            await axios.post(`${API_URL}/api/language-otp/send`, { email });
            toast.success('Verification code sent to your email');
            setTimeLeft(120);
            setCanResend(false);
        } catch (err) {
            console.error(err);
            toast.error('Could not send verification code, try again');
            setPendingLangCode(null); // bail out of the flow on send failure
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSelectLanguage = async (lang) => {
        setOpen(false);

        if (!OTP_GATED_LANGUAGES.includes(lang.code)) {
            setLanguage(lang.code);
            return;
        }

        if (lang.code === language) return; // already on this language

        if (!user?.email) {
            toast.error('Please sign in to switch to French');
            return;
        }

        setOtp('');
        setPendingLangCode(lang.code);
        await sendLanguageOtp(user.email);
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Enter the code');
            return;
        }
        setVerifying(true);
        try {
            await axios.post(`${API_URL}/api/language-otp/verify`, {
                email: user.email,
                otp,
            });
            setLanguage(pendingLangCode);
            toast.success('Language switched to French');
            setPendingLangCode(null);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (err.response?.status === 404) toast.error(msg || 'No code found, please resend');
            else if (err.response?.status === 400) toast.error(msg || 'Incorrect or expired code');
            else toast.error('Verification failed, try again');
        } finally {
            setVerifying(false);
        }
    };

    const current = SUPPORTED_LANGUAGES.find((l) => l.code === language);

    return (
        <>
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                    <Globe size={15} className="text-gray-400" />
                    {current?.label || 'English'}
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelectLanguage(lang)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                            >
                                {lang.label}
                                {lang.code === language && <Check size={14} className="text-emerald-600" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── OTP verification modal, only shown when switching to a gated language ── */}
            {pendingLangCode && (
                <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setPendingLangCode(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            aria-label="Cancel"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                            <ShieldCheck size={22} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-800">Confirm Language Change</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter the code we sent to <span className="font-semibold text-gray-700">{user?.email}</span> to switch to French.
                        </p>

                        {sendingOtp ? (
                            <div className="flex items-center justify-center py-8 text-indigo-600">
                                <Loader2 className="animate-spin" size={24} />
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full tracking-[0.5em] text-center text-lg font-bold py-3 mt-5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all"
                                />

                                <p className="text-xs text-gray-400 text-center mt-2">
                                    {canResend ? 'Code expired' : `Expires in ${minutes}:${seconds.toString().padStart(2, '0')}`}
                                </p>

                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={verifying || otp.length !== 6}
                                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {verifying ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                                    Verify & Switch
                                </button>

                                <button
                                    onClick={() => sendLanguageOtp(user.email)}
                                    disabled={!canResend}
                                    className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed underline decoration-dotted"
                                >
                                    Resend code
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}