'use client'
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"
import axios from "axios"
import Footer from "@/components/Footer"
import { useLanguage } from "@/context/LanguageContext"; // 🌍 1. Hook up core context engine
import { toast } from "react-toastify"
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/components/Firebase"
import { MapPin, Clock, Building2, Tag, ArrowLeft, Loader2, CheckCircle } from "lucide-react"

interface Internship {
  _id: string
  title: string
  company: string
  location: string
  stipend: string
  duration: string
  category: string
  description?: string
  aboutCompany?: string
}

export default function InternDetail() {
  const { t } = useLanguage() // 🌍 2. Initialize translation context state hook
  const { slug } = useParams()
  const router = useRouter()

  const [item, setItem] = useState<Internship | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Fetch the single internship details from backend
  useEffect(() => {
    const fetchInternshipDetail = async () => {
      if (!slug) return
      try {
        setDataLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getintern/getInternhsips`)

        if (Array.isArray(response.data)) {
          const foundItem = response.data.find((i: Internship) => i._id === String(slug))
          setItem(foundItem || null)
        }
      } catch (error) {
        console.error("Failed to load internship detail:", error)
        toast.error(t('internshipDetail.errorLoading') || "Error loading internship details.")
      } finally {
        setDataLoading(false)
      }
    }

    fetchInternshipDetail()
  }, [slug, t])

  // Check if current authenticated user has already applied
  useEffect(() => {
    if (!currentUser || !item) return

    const checkIfApplied = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/application`, {
          params: { email: currentUser.email }
        })

        if (Array.isArray(response.data)) {
          const alreadyApplied = response.data.some(
            (app: any) => app.Application?.internshipId === item._id
          )
          setHasApplied(alreadyApplied)
        }
      } catch (error) {
        console.error("Failed to verify user application record status:", error)
      }
    }

    checkIfApplied()
  }, [currentUser, item])

  const Post_Application = async () => {
    if (!item) return;

    if (!currentUser) {
      toast.error(t('internshipDetail.loginToApplyAlert') || "Please log in to apply for this internship!")
      return
    }

    if (hasApplied) {
      toast.info(t('internshipDetail.alreadyAppliedAlert') || "You have already applied for this role!")
      return
    }

    try {
      setIsApplying(true)

      const payload = {
        ...item,
        user: {
          uid: currentUser.uid,
          email: currentUser.email
        }
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/application`, payload)
      if (response.status === 200 || response.status === 201) {
        toast.success(t('internshipDetail.successAlert') || "Application submitted successfully!")
        setHasApplied(true)

        // Backend snapshots the applicant's resume onto the application if one
        // exists and reports back whether it found one — warn if not, since a
        // resume-less application is more likely to get rejected.
        if (response.data?.hasResume === false) {
          toast.warning(
            t('internship.noResumeWarning') ||
            "You haven't uploaded a resume yet — your application may get rejected without one."
          )
        }
      }
    } catch (error: any) {
      console.error("Submission failed:", error)
      if (error.response?.status === 403) {
        toast.error(error.response.data?.message || t('internshipDetail.limitReachedDefault') || "You've reached your monthly application limit.")
        toast.info(t('internshipDetail.upgradePromptAlert') || "Upgrade your plan to apply for more internships.", {
          onClick: () => router.push('/membership'),
        })
      } else {
        toast.error(t('internshipDetail.failedAlert') || "Failed to submit application.")
      }
    } finally {
      setIsApplying(false)
    }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    )
  }

  if (!item) return (
    <div className="min-h-screen max-md:pt-35 bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <p className="text-lg font-medium">{t('internshipDetail.notFound') || "Internship not found."}</p>
        <button onClick={() => router.push('/internship')}
          className="mt-4 text-blue-600 text-sm hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> {t('internshipDetail.backToInternships') || "Back to Internships"}
        </button>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 pt-40 max-md:pt-72 pb-16">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={15} /> {t('internshipDetail.backBtn') || "Back"}
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              {t('internshipDetail.internshipBadge') || "Internship"}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{item.title}</h1>
            <p className="text-blue-600 font-semibold text-lg mt-1">{item.stipend}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3"><Building2 size={15} className="text-gray-400 shrink-0" /><span>{item.company}</span></div>
            <div className="flex items-center gap-3"><MapPin size={15} className="text-emerald-500 shrink-0" /><span>{item.location}</span></div>
            <div className="flex items-center gap-3"><Clock size={15} className="text-gray-400 shrink-0" /><span>{item.duration}</span></div>
            <div className="flex items-center gap-3"><Tag size={15} className="text-gray-400 shrink-0" /><span>{item.category}</span></div>
          </div>

          {item.description && (
            <div className="text-sm">
              <h3 className="font-semibold text-gray-800 mb-2">
                {t('internshipDetail.descriptionLabel') || "Description"}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
          )}

          {/* ── Dynamic Action Button Localization Block ── */}
          {!currentUser ? (
            <button onClick={() => toast.error(t('internshipDetail.loginToApplyAlert') || "Please log in to apply!")}
              className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-2xl text-sm cursor-not-allowed mt-4">
              {t('internshipDetail.actionLogin') || "Log in to Apply"}
            </button>
          ) : hasApplied ? (
            <div className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-semibold py-3 rounded-2xl text-sm border border-blue-200 mt-4">
              <CheckCircle size={16} /> {t('internshipDetail.actionSubmitted') || "Application Submitted"}
            </div>
          ) : (
            <button
              onClick={Post_Application}
              disabled={isApplying}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-2xl transition text-sm mt-4">
              {isApplying ? (t('internshipDetail.actionApplying') || "Applying...") : (t('internshipDetail.actionApply') || "Apply Now →")}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}