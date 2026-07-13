"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../components/Firebase"; // Adjust path if needed
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { CgGoogle } from "react-icons/cg";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Synchronize the user data to your Node.js/MongoDB backend database
    const syncUserToBackend = async (uid: string, displayName: string, userEmail: string, photoURL: string) => {
        try {
            // Reusing the same endpoint logic we verified in your community posts router
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/sync-user`, {
                uid: uid,
                name: displayName,
                email: userEmail,
                avatar: photoURL || "",
                title: "Fresher", // Default title value initialization
                bio: "Passionate developer open to new opportunities."
            });
        } catch (err) {
            console.error("Failed to sync new profile documentation to MongoDB", err);
        }
    };

    // 1. Email/Password Signup Function
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.error("Please fill out all fields.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            // Step A: Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const firebaseUser = userCredential.user;

            // Step B: Set the Profile Display Name inside Firebase
            await updateProfile(firebaseUser, {
                displayName: name.trim()
            });

            // Step C: Sync the new record immediately into your MongoDB Users table
            await syncUserToBackend(
                firebaseUser.uid,
                name.trim(),
                firebaseUser.email || "",
                firebaseUser.photoURL || ""
            );

            toast.success("Account created successfully!");
            router.push("/");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                toast.error("This email address is already registered.");
            } else if (err.code === "auth/invalid-email") {
                toast.error("Please enter a valid email address.");
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // 2. Google OAuth Alternative Signup Function
    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const gUser = result.user;

            // Sync Google profile details down into MongoDB database collection
            await syncUserToBackend(
                gUser.uid,
                gUser.displayName || "Community Member",
                gUser.email || "",
                gUser.photoURL || ""
            );

            toast.success(`Account registered as ${gUser.displayName}!`);
            router.push("/");
        } catch (err) {
            console.error(err);
            toast.error("Google registration failed.");
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Get Started</h1>
                    <p className="text-sm text-gray-400">Join Intern Area to connect with peers and find opportunities.</p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleRegister} className="space-y-4">

                    {/* Full Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Full Name</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition bg-white">
                            <User size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Sanjay Raj"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full outline-none text-sm bg-transparent text-gray-800"
                                disabled={loading}
                            />
                        </div>
                    </div>

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
                        <label className="text-xs font-bold text-gray-700">Password</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition bg-white">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full outline-none text-sm bg-transparent text-gray-800"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                {/* Design Layout Divider lines */}
                <div className="relative flex py-2 items-center text-gray-400">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-xs font-medium uppercase tracking-wider text-gray-400">Or join with</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Google Registration Node */}
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition text-sm text-gray-700 font-medium"
                >
                    <CgGoogle size={18} />
                    <span>Google Account</span>
                </button>

                {/* Navigation Redirection Link to Login page view */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    Already have an account?{" "}
                    <button
                        onClick={() => router.push("/login")}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Log in here
                    </button>
                </p>

            </div>
        </div>
    );
}