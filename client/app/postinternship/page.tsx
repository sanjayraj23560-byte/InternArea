'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Briefcase, IndianRupee, Calendar, MapPin, Building2, FileText, PlusCircle, Clock, Tag, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const inputCls = "w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition"
const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wider"

interface FieldProps {
    label: string;
    icon: React.ReactNode;
    name: string;
    placeholder?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field = ({ label, icon, name, placeholder, type = "text", value, onChange }: FieldProps) => (
    <div className="flex flex-col gap-2">
        <label className={labelCls}>{label}</label>
        <div className="relative flex items-center">
            <span className="absolute left-4 text-blue-500">{icon}</span>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className={inputCls}
            />
        </div>
    </div>
)

function PostInternships() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        stipend: '',
        aboutCompany: '',
        aboutInternship: '',
        whocanApply: '',
        perks: '',
        noOfOpenings: '',
        startDate: '',
        duration: '',
        category: '',
        additionalInformation: '',
        Application_start: '',
        Application_ending: '',
        description: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const required = ['title', 'company', 'location', 'stipend', 'duration', 'category', 'description', 'Application_start', 'Application_ending']
        const missing = required.filter(k => !formData[k as keyof typeof formData])

        if (missing.length > 0) {
            toast.error("Please fill in all required fields")
            return
        }

        if (new Date(formData.Application_ending) <= new Date(formData.Application_start)) {
            toast.error("Application ending must be after start date")
            return
        }

        try {
            setIsLoading(true)

            // Explicitly payload format mapping
            const payload = {
                ...formData,
                noOfOpenings: formData.noOfOpenings ? Number(formData.noOfOpenings) : 1
            }

            // NOTE: Swap localhost path out for environment variables when moving to production!
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/internship/internship`, payload)
            console.log("Successfully posted:", res.data)

            toast.success("Internship posted successfully!")

            setFormData({
                title: '', company: '', location: '', stipend: '',
                aboutCompany: '', aboutInternship: '', whocanApply: '',
                perks: '', noOfOpenings: '', startDate: '', duration: '',
                category: '', additionalInformation: '',
                Application_start: '', Application_ending: '', description: '',
            })

            setTimeout(() => router.push('/adminpanel'), 1200)
        } catch (err) {
            console.error(err)
            toast.error("Failed to post internship. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center mt-40">
            {/* Header */}
            <header className="w-full max-w-3xl flex items-center justify-between mb-8 pb-5 border-b border-gray-200">
                <button onClick={() => router.push('/adminpanel')}
                    className="flex items-center gap-2 text-gray-500 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm">
                    <ArrowLeft size={16} />Back to Panel
                </button>
                <h1 className="text-xl font-bold text-gray-900">Post New Internship</h1>
            </header>

            <form onSubmit={handleSubmit}
                className="w-full max-w-3xl flex flex-col gap-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">

                {/* Row 1: Title & Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Internship Title" name="title" icon={<Briefcase size={16} />} placeholder="e.g. Frontend Developer Intern" value={formData.title} onChange={handleChange} />
                    <Field label="Company Name" name="company" icon={<Building2 size={16} />} placeholder="e.g. Google" value={formData.company} onChange={handleChange} />
                </div>

                {/* Row 2: Stipend, Duration, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Field label="Stipend (per month)" name="stipend" icon={<IndianRupee size={16} />} placeholder="e.g. ₹15,000" value={formData.stipend} onChange={handleChange} />
                    <Field label="Duration" name="duration" icon={<Calendar size={16} />} placeholder="e.g. 3 Months" value={formData.duration} onChange={handleChange} />
                    <Field label="Location" name="location" icon={<MapPin size={16} />} placeholder="e.g. Bengaluru / Remote" value={formData.location} onChange={handleChange} />
                </div>

                {/* Row 3: Category, Openings, Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className={labelCls}>Category</label>
                        <div className="relative flex items-center">
                            <Tag size={16} className="absolute left-4 text-blue-500" />
                            <select name="category" value={formData.category} onChange={handleChange} required
                                className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition appearance-none">
                                <option value="">Select category</option>
                                {["Engineering", "Design", "Data Science", "Media", "MBA", "Big Brands", "Work from home", "Part time"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Field label="No. of Openings" name="noOfOpenings" icon={<Users size={16} />} placeholder="e.g. 5" type="number" value={formData.noOfOpenings} onChange={handleChange} />
                    <Field label="Start Date" name="startDate" icon={<Calendar size={16} />} type="date" value={formData.startDate} onChange={handleChange} />
                </div>

                {/* Row 4: Application window */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Application Start" name="Application_start" icon={<Clock size={16} />} type="datetime-local" value={formData.Application_start} onChange={handleChange} />
                    <Field label="Application Ending" name="Application_ending" icon={<Clock size={16} />} type="datetime-local" value={formData.Application_ending} onChange={handleChange} />
                </div>

                {/* About Company */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls}>About the Company</label>
                    <div className="relative">
                        <Building2 size={16} className="absolute left-4 top-3.5 text-blue-500" />
                        <textarea name="aboutCompany" rows={2} placeholder="Brief about the company..."
                            value={formData.aboutCompany} onChange={handleChange}
                            className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none" />
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls}>Internship Description & Requirements</label>
                    <div className="relative">
                        <FileText size={16} className="absolute left-4 top-3.5 text-blue-500" />
                        <textarea name="description" rows={4} placeholder="Responsibilities, skills required (React, Node.js etc.)..."
                            value={formData.description} onChange={handleChange} required
                            className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-vertical" />
                    </div>
                </div>

                {/* Who can apply */}
                <div className="flex flex-col gap-2">
                    <label className={labelCls}>Who Can Apply</label>
                    <div className="relative">
                        <Users size={16} className="absolute left-4 top-3.5 text-blue-500" />
                        <textarea name="whocanApply" rows={2} placeholder="e.g. Students in 3rd or 4th year pursuing CS/IT..."
                            value={formData.whocanApply} onChange={handleChange}
                            className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none" />
                    </div>
                </div>

                {/* Perks & Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                        <label className={labelCls}>Perks</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-4 top-3.5 text-blue-500" />
                            <textarea name="perks" rows={2} placeholder="e.g. Certificate, LOR, PPO..."
                                value={formData.perks} onChange={handleChange}
                                className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelCls}>Additional Information</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-4 top-3.5 text-blue-500" />
                            <textarea name="additionalInformation" rows={2} placeholder="Any other details..."
                                value={formData.additionalInformation} onChange={handleChange}
                                className="w-full bg-white border border-gray-200 text-gray-800 pl-11 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-400 transition resize-none" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold p-3.5 rounded-xl transition text-sm mt-2">
                    <PlusCircle size={18} />
                    {isLoading ? "Posting..." : "Post Internship"}
                </button>
            </form>
        </div>
    )
}

export default PostInternships