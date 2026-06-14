'use client'
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { MapPin, Briefcase, Building2, Tag, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/components/Firebase"
import axios from "axios"
import { toast } from "react-toastify"

interface Job {
    _id: string
    title: string
    company: string
    location: string
    salary: string
    experience: string
    category: string
}

export default function JobDetail() {
    const { slug } = useParams()
    const router = useRouter()

    const [job, setJob] = useState<Job | null>(null)
    const [dataLoading, setDataLoading] = useState(true)

    const [user, setUser] = useState<{ uid: string; email: string } | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (u) setUser({ uid: u.uid, email: u.email || "" })
            else setUser(null)
            setAuthLoading(false)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        const fetchJobData = async () => {
            if (!slug) return
            try {
                setDataLoading(true)
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/getjob`)

                if (Array.isArray(res.data)) {
                    const foundJob = res.data.find((j: Job) => j._id === String(slug))
                    setJob(foundJob || null)
                }
            } catch (err) {
                console.error("Error fetching job details:", err)
                toast.error("Could not load job details.")
            } finally {
                setDataLoading(false)
            }
        }
        fetchJobData()
    }, [slug])

    useEffect(() => {
        if (!user || !job) return
        const check = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications`,
                    { params: { email: user.email } }
                )
                const alreadyApplied = res.data.some(
                    (app: any) => app.Application?.internshipId === job._id || app._id === job._id
                )
                setApplied(alreadyApplied)
            } catch (err) {
                console.error("Error verifying application lookup status:", err)
            }
        }
        check()
    }, [user, job])

    const handleApply = async () => {
        if (!user) {
            toast.error("Please sign in with Google to apply")
            return
        }
        if (applied) {
            toast("You've already applied for this job")
            return
        }
        try {
            setApplying(true)
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications`,
                {
                    _id: job!._id,
                    company: job!.company,
                    category: job!.category,
                    title: job!.title,
                    location: job!.location,
                    salary: job!.salary,
                    experience: job!.experience,
                    user: { uid: user.uid, email: user.email }
                }
            )
            setApplied(true)
            toast.success("Application submitted successfully!")
        } catch (err) {
            console.error(err)
            toast.error("Failed to apply. Please try again.")
        } finally {
            setApplying(false)
        }
    }
    if (authLoading || dataLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-emerald-600" size={24} />
            </div>
        )
    }

    if (!job) return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <p className="text-lg font-medium">Job not found.</p>
                <button onClick={() => router.push('/jobs')}
                    className="mt-4 text-emerald-600 text-sm hover:underline flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to Jobs
                </button>
            </div>
            <Footer />
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 pt-40 max-md:pt-72 pb-16">
                <button onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6 transition">
                    <ArrowLeft size={15} /> Back
                </button>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
                    <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Full Time</span>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{job.title}</h1>
                        <p className="text-emerald-600 font-semibold text-lg mt-1">{job.salary}</p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3"><Building2 size={15} className="text-gray-400 shrink-0" /><span>{job.company}</span></div>
                        <div className="flex items-center gap-3"><MapPin size={15} className="text-emerald-500 shrink-0" /><span>{job.location}</span></div>
                        <div className="flex items-center gap-3"><Briefcase size={15} className="text-gray-400 shrink-0" /><span>{job.experience}</span></div>
                        <div className="flex items-center gap-3"><Tag size={15} className="text-gray-400 shrink-0" /><span>{job.category}</span></div>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl px-5 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Monthly Salary</p>
                            <p className="text-xl font-bold text-emerald-600 mt-0.5">{job.salary}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Experience</p>
                            <p className="text-base font-semibold text-gray-800 mt-0.5">{job.experience}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h2 className="font-semibold text-gray-800 mb-2">About this role</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            <span className="text-gray-700 font-medium">{job.company}</span> is hiring
                            a <span className="text-gray-700 font-medium">{job.title}</span> in {job.location}.
                            This is a {job.category} role requiring {job.experience} of experience.
                        </p>
                    </div>

                    {/* ── Apply button logic ── */}
                    {!user ? (
                        <button onClick={() => toast.error("Please sign in with Google to apply")}
                            className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-2xl text-sm cursor-not-allowed">
                            Sign in to Apply
                        </button>
                    ) : applied ? (
                        <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-semibold py-3 rounded-2xl text-sm border border-emerald-200">
                            <CheckCircle size={16} /> Already Applied
                        </div>
                    ) : (
                        <button onClick={handleApply} disabled={applying}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition text-sm">
                            {applying ? "Submitting..." : "Apply Now →"}
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}