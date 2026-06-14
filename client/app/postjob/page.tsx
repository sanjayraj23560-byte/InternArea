"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Briefcase,
    IndianRupee,
    Calendar,
    MapPin,
    Building2,
    FileText,
    PlusCircle,
} from "lucide-react";

function PostJobs() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        CTC: "",
        Experience: "",
        place: "",
        description: "",
        category: "Engineering",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { title, company, CTC, Experience, place, description } = formData;

        if (!title || !company || !CTC || !Experience || !place || !description) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setIsLoading(true);

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/job/jobpost`,
                formData
            );

            console.log(res.data);
            toast.success("Job posted successfully!");

            setFormData({
                title: "",
                company: "",
                CTC: "",
                Experience: "",
                place: "",
                description: "",
                category: "Engineering",
            });

            setTimeout(() => {
                router.push("/adminpanel");
            }, 1200);
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Failed to post job");
        } finally {
            setIsLoading(false);
        }
    };

    const inputCls =
        "w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 mt-30 flex flex-col items-center font-sans">
            <header className="w-full max-w-3xl flex items-center justify-between mb-8 pb-5 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => router.push("/adminpanel")}
                    className="flex items-center gap-2 text-gray-500 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Panel
                </button>

                <h1 className="text-xl font-bold text-gray-900">Post New Job</h1>
            </header>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-3xl flex flex-col gap-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Job Title
                        </label>

                        <div className="relative flex items-center">
                            <Briefcase size={16} className="absolute left-4 text-blue-500" />

                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Full Stack Developer"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Company Name
                        </label>

                        <div className="relative flex items-center">
                            <Building2 size={16} className="absolute left-4 text-blue-500" />

                            <input
                                type="text"
                                name="company"
                                placeholder="e.g. Google"
                                value={formData.company}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            CTC
                        </label>

                        <div className="relative flex items-center">
                            <IndianRupee size={16} className="absolute left-4 text-blue-500" />

                            <input
                                type="text"
                                name="CTC"
                                placeholder="e.g. 12 LPA"
                                value={formData.CTC}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Experience
                        </label>

                        <div className="relative flex items-center">
                            <Calendar size={16} className="absolute left-4 text-blue-500" />

                            <input
                                type="text"
                                name="Experience"
                                placeholder="e.g. 1–3 years"
                                value={formData.Experience}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Location
                        </label>

                        <div className="relative flex items-center">
                            <MapPin size={16} className="absolute left-4 text-blue-500" />

                            <input
                                type="text"
                                name="place"
                                placeholder="e.g. Bengaluru / Remote"
                                value={formData.place}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                    </label>

                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition"
                    >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Job Description & Requirements
                    </label>

                    <div className="relative">
                        <FileText size={16} className="absolute left-4 top-3.5 text-blue-500" />

                        <textarea
                            name="description"
                            rows={5}
                            placeholder="Outline responsibilities, skills required, and perks..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-y"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold p-3.5 rounded-xl transition text-sm"
                >
                    <PlusCircle size={18} />
                    {isLoading ? "Publishing..." : "Publish Job"}
                </button>
            </form>
        </div>
    );
}

export default PostJobs;