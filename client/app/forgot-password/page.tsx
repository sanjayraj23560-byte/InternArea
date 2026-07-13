"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Mail, Phone, ArrowLeft, Loader2, AlertTriangle, KeyRound } from "lucide-react";

export default function ForgotPassword() {
    const [method, setMethod] = useState<"email" | "phone">("email");
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const router = useRouter();

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) {
            toast.error("Please fill out the input field first.");
            return;
        }

        setLoading(true);
        setGeneratedPassword(null);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                identifier: inputValue
            });

            toast.success("Reset request approved!");
            if (res.data.tempPassword) {
                setGeneratedPassword(res.data.tempPassword);
            }
        } catch (err: any) {
            // Captures the 24-hour limit block message perfectly
            const errorMsg = err.response?.data?.message || "Something went wrong.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">

                {/* Back navigation anchor */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
                >
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-xs text-gray-400">Choose your identification method to securely regenerate your account credentials.</p>
                </div>

                {/* Method Toggle Buttons */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => { setMethod("email"); setInputValue(""); setGeneratedPassword(null); }}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${method === "email" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                    >
                        <Mail size={14} /> Email
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMethod("phone"); setInputValue(""); setGeneratedPassword(null); }}
                        className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${method === "phone" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                    >
                        <Phone size={14} /> Phone Number
                    </button>
                </div>

                {/* Action form block */}
                <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 capitalize">Registered {method}</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400 transition bg-white">
                            {method === "email" ? <Mail size={16} className="text-gray-400" /> : <Phone size={16} className="text-gray-400" />}
                            <input
                                type={method === "email" ? "email" : "text"}
                                placeholder={method === "email" ? "name@example.com" : "+91 XXXXX XXXXX"}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full outline-none text-sm bg-transparent"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? "Processing Reset..." : "Request New Password"}
                    </button>
                </form>

                {/* Display generated temporary credentials block securely */}
                {generatedPassword && (
                    <div className="border border-emerald-100 bg-emerald-50/40 rounded-2xl p-4 space-y-2 animate-fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                            <KeyRound size={14} />
                            <span>Temporary Password Generated!</span>
                        </div>
                        <p className="text-lg font-mono font-bold tracking-wider text-gray-800 bg-white border border-emerald-100 rounded-xl px-3 py-2 text-center select-all">
                            {generatedPassword}
                        </p>
                        <p className="text-[10px] text-gray-400 text-center leading-normal">This password contains letters only. Copy this code to securely access your profile settings page to reset your permanent password.</p>
                    </div>
                )}

            </div>
        </div>
    );
}