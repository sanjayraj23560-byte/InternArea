'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/components/Firebase';
import { toast } from 'react-toastify';
import { ShieldCheck, X, Loader2 } from 'lucide-react';
const SESSION_KEY_PREFIX = 'login_verified_';

const LoginGateContext = createContext({ gateReady: true });
export function useLoginGate() {
    return useContext(LoginGateContext);
}

export function LoginGateProvider({ children }) {
    const [pendingUser, setPendingUser] = useState(null);
    const [otp, setOtp] = useState('');
    const [loginAttemptId, setLoginAttemptId] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [checking, setChecking] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState(null);

    const handledUids = useRef(new Set());

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const sessionKey = `${SESSION_KEY_PREFIX}${user.uid}`;
            const alreadyVerifiedThisSession =
                typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey);

            if (alreadyVerifiedThisSession || handledUids.current.has(user.uid)) {
                return;
            }
            handledUids.current.add(user.uid);

            setChecking(true);
            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login/check`, {
                    uid: user.uid,
                    email: user.email,
                });

                if (res.data.allowed) {
                    window.sessionStorage.setItem(sessionKey, '1');
                    setChecking(false);
                    return;
                }

                if (res.data.otpRequired) {
                    setLoginAttemptId(res.data.loginAttemptId);
                    setPendingUser(user);
                    setChecking(false);
                    return;
                }

                // Neither allowed nor otpRequired means it was blocked outright
                // (e.g. mobile login outside the allowed window)
                setBlockedMessage(res.data.message || 'Login not allowed right now.');
                await auth.signOut();
                handledUids.current.delete(user.uid);
                setChecking(false);
            } catch (err) {
                console.error('Login gate check failed:', err);
                // Fails open on a network/server error rather than locking everyone
                // out — swap to `await auth.signOut()` here if you'd rather fail closed.
                setChecking(false);
            }
        });
        return () => unsub();
    }, []);

    const handleVerifyOtp = async () => {
        if (!pendingUser || !otp) {
            toast.error('Enter the code');
            return;
        }
        setVerifying(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login/verify-otp`, {
                email: pendingUser.email,
                otp,
                loginAttemptId,
            });
            window.sessionStorage.setItem(`${SESSION_KEY_PREFIX}${pendingUser.uid}`, '1');
            toast.success('Login verified');
            setPendingUser(null);
            setOtp('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleCancelOtp = async () => {
        if (pendingUser) {
            handledUids.current.delete(pendingUser.uid);
        }
        await auth.signOut();
        setPendingUser(null);
        setOtp('');
    };

    return (
        <LoginGateContext.Provider value={{ gateReady: !pendingUser && !checking }}>
            {children}

            {blockedMessage && (
                <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
                        <h3 className="text-lg font-bold text-gray-800">Access Restricted</h3>
                        <p className="text-sm text-gray-500 mt-2">{blockedMessage}</p>
                        <button
                            onClick={() => setBlockedMessage(null)}
                            className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}

            {pendingUser && (
                <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={handleCancelOtp}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            aria-label="Cancel"
                        >
                            <X size={18} />
                        </button>

                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                            <ShieldCheck size={22} />
                        </div>

                        <h3 className="text-lg font-bold text-gray-800">Verify Your Login</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            We detected a Chrome login. Enter the code sent to{' '}
                            <span className="font-semibold text-gray-700">{pendingUser.email}</span>.
                        </p>

                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000000"
                            className="w-full tracking-[0.5em] text-center text-lg font-bold py-3 mt-5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all"
                        />

                        <button
                            onClick={handleVerifyOtp}
                            disabled={verifying || otp.length !== 6}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                        >
                            {verifying ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                            Verify & Continue
                        </button>
                    </div>
                </div>
            )}
        </LoginGateContext.Provider>
    );
}