'use client'
import React, { useEffect, useState } from 'react'
import { Filter, Search, MapPin, Clock, Building2, Tag, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'

interface Internship {
  _id: string
  title: string
  company: string
  location: string
  stipend: string
  duration: string
  category: string
}

const categories = ["All", "Engineering", "Design", "Data Science", "Media", "MBA", "Big Brands", "Work from home", "Part time"]

const Internship = () => {
  const [allInternships, setAllInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const [search, setSearch] = useState("")
  const [profile, setProfile] = useState("")
  const [location, setLocation] = useState("")
  const [wfh, setWfh] = useState(false)
  const [partTime, setPartTime] = useState(false)
  const [activeCategory, setActiveCategory] = useState("All")

  // ✅ SAFE LOGGING: This tracks the state safely without breaking memory closures


  useEffect(() => {
    const GetInterns = async () => {
      try {
        // NOTE: Replace with process.env.NEXT_PUBLIC_API_URL in production
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getintern/getInternhsips`)
        if (Array.isArray(res.data)) {
          setAllInternships(res.data)
        }
      } catch (err) {
        console.error(err)
        toast.error("Server busy, try again later!")
      } finally {
        setLoading(false)
      }
    }
    GetInterns()
  }, [])
  
  useEffect(() => {
    console.log("Updated Internship Data Pool:", allInternships)
  }, [allInternships])
  const filtered = allInternships.filter(item => {
    if (activeCategory !== "All" && item.category !== activeCategory) return false
    if (wfh && !item.location.toLowerCase().includes("remote") && !item.location.toLowerCase().includes("home")) return false
    if (partTime && item.category !== "Part time") return false // ⚠️ Verify your database records match this exactly
    if (profile && !item.title.toLowerCase().includes(profile.toLowerCase())) return false
    if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition"

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 pt-40 max-md:pt-72 pb-16">

        <div className="mb-8">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Actively Hiring</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Browse Internships</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading..." : `${filtered.length} internships found`}
          </p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white"
                }`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <aside className="w-72 shrink-0 hidden lg:flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Filter size={16} className="text-blue-600" />
                <span className="font-semibold text-gray-800 text-sm">Filters</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Profile</label>
                  <input type="text" placeholder="e.g. Software Engineer" value={profile}
                    onChange={e => setProfile(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">Location</label>
                  <input type="text" placeholder="e.g. Bangalore" value={location}
                    onChange={e => setLocation(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={wfh} onChange={e => setWfh(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-sm text-gray-700">Work from <span className="text-blue-600 font-medium">home</span></span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={partTime} onChange={e => setPartTime(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-sm text-gray-700">Part-time <span className="text-blue-600 font-medium">only</span></span>
                  </label>
                </div>
                {(profile || location || wfh || partTime) && (
                  <button onClick={() => { setProfile(""); setLocation(""); setWfh(false); setPartTime(false) }}
                    className="w-full text-sm text-red-500 border border-red-200 rounded-xl py-1.5 hover:bg-red-50 transition">
                    Clear filters ✕
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Keyword Search</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 gap-2 focus-within:border-blue-400 transition">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input type="text" placeholder="Search internships..." value={search}
                  onChange={e => setSearch(e.target.value)} className="w-full text-sm outline-none bg-transparent" />
              </div>
            </div>
          </aside>

          {/* Cards Content */}
          <div className="flex-1">
            <div className="lg:hidden flex items-center border border-gray-200 bg-white rounded-xl px-3 py-2 gap-2 mb-4 shadow-sm">
              <Search size={15} className="text-gray-400" />
              <input type="text" placeholder="Search internships..." value={search}
                onChange={e => setSearch(e.target.value)} className="w-full text-sm outline-none" />
            </div>

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Search size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No internships match your filters.</p>
                <p className="text-sm mt-1">Try adjusting your search or clearing filters.</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(item => (
                  <div key={item._id}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">{item.title}</h3>
                      <p className="text-blue-600 font-medium text-sm mt-0.5">{item.stipend}</p>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-500">
                      <div className="flex items-center gap-2"><Building2 size={13} className="text-gray-400 shrink-0" />{item.company}</div>
                      <div className="flex items-center gap-2"><MapPin size={13} className="text-emerald-500 shrink-0" />{item.location}</div>
                      <div className="flex items-center gap-2"><Clock size={13} className="text-gray-400 shrink-0" />{item.duration}</div>
                      <div className="flex items-center gap-2"><Tag size={13} className="text-gray-400 shrink-0" />{item.category}</div>
                    </div>
                    <button onClick={() => router.push(`/intern/${item._id}`)}
                      className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-medium text-sm py-2 rounded-xl transition">
                      View Details <ArrowRight size={13} />
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

export default Internship