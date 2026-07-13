'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BiLeftArrow, BiLeftArrowAlt } from 'react-icons/bi'
import { Mail, BriefcaseIcon, Send, UsersIcon, Settings, BarChart2, TrendingUp, TrendingDown } from 'lucide-react'

const stats = [
  { label: "Active Hiring", value: "2,521", change: "+12%", up: true },
  { label: "Active Jobs", value: "45", change: "+3%", up: true },
  { label: "Active Internships", value: "89", change: "+24%", up: true },
  { label: "Conversion Rate", value: "2.1%", change: "-1%", up: false },
]

const actions = [
  {
    icon: <Mail size={22} />,
    title: "View Applications",
    route: "application",
    desc: "Review all applications and manage candidates",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <BriefcaseIcon size={22} />,
    title: "Post a Job",
    route: "postjob",
    desc: "Create and publish new job opportunities",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <Send size={22} />,
    title: "Post Internship",
    route: "postinternship",
    desc: "Create and manage internship positions",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: <UsersIcon size={22} />,
    title: "Manage Users",
    route: "manageusers",
    desc: "View and manage all user accounts",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <BarChart2 size={22} />,
    title: "Analytics",
    route: "analytics",
    desc: "View detailed reports and statistics",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: <Settings size={22} />,
    title: "Settings",
    route: "settings",
    desc: "Configure system preferences",
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
]

function AdminPanel() {
 
  const route = useRouter()
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 pt-40 max-md:pt-72 pb-16 space-y-10">
        <div className='flex border-2 border-amber-950 w-fit rounded-2xl p-2 items-center'>
          <BiLeftArrowAlt /><button onClick={() => route.push('/adminlogin')}>Back</button>
        </div>
        {/* ── Header ── */}
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Dashboard</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your jobs, internships and applications</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ── */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((a) => (
              <button
                onClick={() => route.push(`/${a.route}`)}
                key={a.title}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex flex-col gap-3"
              >
                <div className={`${a.bg} ${a.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                  {a.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}

export default AdminPanel