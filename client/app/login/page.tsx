"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../components/Firebase"; // Adjust path to your Firebase file if needed
import { toast } from "react-toastify";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { CgGoogle } from "react-icons/cg";
import axios from "axios";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // 1. Manual Email/Password Login Function
    // 1. Manual Email/Password Login Function
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill out all fields.");
            return;
        }

        setLoading(true);
        try {
            // Step A: Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const firebaseUser = userCredential.user;

            // Step B: Verify the user document exists in your MongoDB backend database
            // This hits the GET /api/user/me operation endpoint we registered on your server
            await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                params: { uid: firebaseUser.uid }
            });

            toast.success("Logged in successfully!");
            router.push("/"); // Send user back to homepage
        } catch (err: any) {
            console.error(err);

            // Check if it's an AxiosError pointing to a missing MongoDB profile record
            if (err.response && err.response.status === 404) {
                toast.warning("Profile context out of sync. Please re-register or update your settings.");
                router.push("/");
                return;
            }

            // Friendly readable error strings from Firebase auth codes
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                toast.error("Invalid email or password.");
            } else if (err.code === "auth/invalid-email") {
                toast.error("Please enter a valid email address.");
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    // 2. Google OAuth Alternative Login Function
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            toast.success(`Welcome back, ${result.user.displayName}!`);
            router.push("/");
        } catch (err) {
            console.error(err);
            toast.error("Google login failed.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 max-md:pt-35 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-gray-400">Log in to manage your connections and explore internships.</p>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Email Address</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition bg-white">
                            <Mail size={16} className="text-gray-400" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full outline-none text-sm bg-transparent text-gray-800"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-700">Password</label>

                            {/* LINK TO YOUR NEW FORGOT PASSWORD FEATURE */}
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-xs font-medium text-blue-600 hover:underline"
                            >
                                Forgot?
                            </button>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition bg-white">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none text-sm bg-transparent text-gray-800"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? "Signing In..." : "Log In"}
                    </button>
                </form>

                {/* Divider lines formatting rule layout */}
                <div className="relative flex py-2 items-center text-gray-400">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs font-medium uppercase tracking-wider text-gray-400">Or continue with</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Social Authentication Access Panel */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition text-sm text-gray-700 font-medium"
                >
                    <CgGoogle size={18} />
                    <span>Google Account</span>
                </button>

                {/* Sign up prompt footer panel redirection routing node links */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Don&apos;t have an account yet?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Register here
                    </button>
                </p>

            </div>
        </div>
    );
} 