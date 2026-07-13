'use client'
import React, { useState, useEffect } from 'react'
import { Filter, Search, MapPin, Building2, Tag, ArrowRight, Briefcase } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'

const categories = ["All", "Engineering", "Design", "Data Science", "Media", "MBA", "Big Brands", "Sales", "Work from home", "Part time"]

const Jobs = () => {
    const { t, currentLang } = useLanguage()
    const router = useRouter()
    const [allJobs, setAllJobs] = useState([])
    const [search, setSearch] = useState("")
    const [profile, setProfile] = useState("")
    const [location, setLocation] = useState("")
    const [wfh, setWfh] = useState(false)
    const [partTime, setPartTime] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All")

    useEffect(() => {
        const NewJobs = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/getjob`
                );
                setAllJobs(res.data);
            } catch (error) {
                if (error.response?.status === 403) {
                    toast.error(t('job.limitReacted') || "Application limit reached.");
                }
                console.error(error);
            }
        }
        NewJobs()
    }, [t])

    const filtered = allJobs.filter(item => {
        if (activeCategory !== "All" && item.category !== activeCategory) return false
        if (wfh && !item.location.toLowerCase().includes("remote") && !item.location.toLowerCase().includes("home")) return false
        if (partTime && item.category !== "Part time") return false
        if (profile && !item.title.toLowerCase().includes(profile.toLowerCase())) return false
        if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false
        if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.company.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400 transition bg-white"

    return (
        <div className="min-h-screen bg-gray-50 flex  flex-col justify-between">
            <main className="max-w-7xl mx-auto px-4 pt-40 max-md:pt-35 pb-16 w-full flex-grow">

                {/* Header Information Section */}
                <div className="mb-8">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                        {t('job.fullTime')}
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 mt-1">
                        {t('job.BrowseJobs')}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {filtered.length} {t('job.jobsFoundCount')}
                    </p>
                </div>

                {/* Filter Categories Horizontal Slide list */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeCategory === cat
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 bg-white"
                                }`}>
                            {cat === "All" && currentLang === "fr" ? "Tout" : cat === "All" && currentLang === "es" ? "Todos" : cat}
                        </button>
                    ))}
                </div>

                {/* Main Content Workspace Layout Split */}
                <div className="flex gap-6 items-start">

                    {/* Desktop Sidebar Filter View Panel */}
                    <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <Filter size={16} className="text-emerald-600" />
                                <span className="font-semibold text-gray-800 text-sm">
                                    {t('job.filter')}
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                                        {t('job.jobTitleLabel')}
                                    </label>
                                    <input type="text" placeholder="e.g. Software Engineer" value={profile}
                                        onChange={e => setProfile(e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                                        {t('job.locationLabel')}
                                    </label>
                                    <input type="text" placeholder="e.g. Bangalore" value={location}
                                        onChange={e => setLocation(e.target.value)} className={inputCls} />
                                </div>
                                <div className="space-y-2.5 pt-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" checked={wfh} onChange={e => setWfh(e.target.checked)} className="w-4 h-4 rounded accent-emerald-600" />
                                        <span className="text-sm text-gray-700">{t('job.wfhLabel')}</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input type="checkbox" checked={partTime} onChange={e => setPartTime(e.target.checked)} className="w-4 h-4 rounded accent-emerald-600" />
                                        <span className="text-sm text-gray-700">{t('job.partTimeLabel')}</span>
                                    </label>
                                </div>
                                {(profile || location || wfh || partTime) && (
                                    <button onClick={() => { setProfile(""); setLocation(""); setWfh(false); setPartTime(false) }}
                                        className="w-full text-sm text-red-500 border border-red-200 rounded-xl py-1.5 hover:bg-red-50 transition">
                                        {t('job.clearFilters')} ✕
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                                {t('job.keywordSearch')}
                            </label>
                            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 gap-2 focus-within:border-emerald-400 transition bg-white">
                                <Search size={15} className="text-gray-400 shrink-0" />
                                <input type="text" placeholder={t('job.searchPlaceholder')} value={search}
                                    onChange={e => setSearch(e.target.value)} className="w-full text-sm outline-none bg-transparent" />
                            </div>
                        </div>
                    </aside>

                    {/* Core Cards Listing Container Grid */}
                    <div className="flex-1 w-full">
                        {/* Mobile view top search panel bar */}
                        <div className="lg:hidden flex items-center border border-gray-200 bg-white rounded-xl px-3 py-2 gap-2 mb-4 shadow-sm">
                            <Search size={15} className="text-gray-400" />
                            <input type="text" placeholder={t('job.searchPlaceholder')} value={search}
                                onChange={e => setSearch(e.target.value)} className="w-full text-sm outline-none" />
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <Search size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium"> {t('job.jobNotFound')}</p>
                                <p className="text-sm mt-1">{t('job.noJobsSubtitle')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map(item => (
                                    <div key={item._id}
                                        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">{item.title}</h3>
                                            <p className="text-emerald-600 font-medium text-sm mt-0.5">{item.salary}</p>
                                        </div>
                                        <div className="space-y-1.5 text-sm text-gray-500">
                                            <div className="flex items-center gap-2"><Building2 size={13} className="text-gray-400 shrink-0" />{item.company}</div>
                                            <div className="flex items-center gap-2"><MapPin size={13} className="text-emerald-500 shrink-0" />{item.location}</div>
                                            <div className="flex items-center gap-2"><Briefcase size={13} className="text-gray-400 shrink-0" />{item.experience}</div>
                                            <div className="flex items-center gap-2"><Tag size={13} className="text-gray-400 shrink-0" />{item.category}</div>
                                        </div>
                                        <button onClick={() => router.push(`/job/${item._id}`)}
                                            className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-medium text-sm py-2 rounded-xl transition">
                                            {t('job.jobDetials')} <ArrowRight size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Jobs;