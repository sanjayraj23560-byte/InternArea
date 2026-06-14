'use client'
import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
    Pencil, Check, X, Plus, Trash2,
    MapPin, Mail, Phone, Globe, Briefcase,
    GraduationCap, Star, Award, ChevronDown, ChevronUp
} from 'lucide-react'

interface Experience {
    id: number; role: string; company: string; duration: string; desc: string
}
interface Education {
    id: number; degree: string; school: string; year: string; grade: string
}
interface Project {
    id: number; name: string; desc: string; link: string
}

const EditField = ({ value, onChange, placeholder, multiline = false, className = "" }: {
    value: string; onChange: (v: string) => void
    placeholder?: string; multiline?: boolean; className?: string
}) => multiline ? (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full border-b-2 border-blue-400 bg-transparent outline-none resize-none text-sm text-gray-700 pb-1 ${className}`}
        rows={3} />
) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className={`border-b-2 border-blue-400 bg-transparent outline-none text-sm text-gray-700 pb-0.5 w-full ${className}`} />
    )
const Section = ({ title, icon, children, onAdd, addLabel }: {
    title: string; icon: React.ReactNode; children: React.ReactNode
    onAdd?: () => void; addLabel?: string
}) => {
    const [open, setOpen] = useState(true)
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 cursor-pointer"
                onClick={() => setOpen(p => !p)}>
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                    {icon}{title}
                </div>
                <div className="flex items-center gap-3">
                    {onAdd && (
                        <button onClick={e => { e.stopPropagation(); onAdd() }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                            <Plus size={13} />{addLabel}
                        </button>
                    )}
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </div>
            {open && <div className="px-6 py-5">{children}</div>}
        </div>
    )
}

const SkillTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
        {label}
        <button onClick={onRemove} className="hover:text-red-500 transition"><X size={11} /></button>
    </span>
)

function User_Profile() {
    // Basic info
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState("Sanjay Raj")
    const [title, setTitle] = useState("Full Stack Developer")
    const [location, setLocation] = useState("Bangalore, India")
    const [email, setEmail] = useState("sanjay@example.com")
    const [phone, setPhone] = useState("+91 98765 43210")
    const [website, setWebsite] = useState("sanjayraj.dev")
    const [bio, setBio] = useState("Passionate developer building impactful products. Open to internships and full-time roles in software engineering.")
    const [avatar, setAvatar] = useState("")

    // Experience
    const [experiences, setExperiences] = useState<Experience[]>([
        { id: 1, role: "Frontend Intern", company: "Google", duration: "Jun 2024 – Aug 2024", desc: "Built React components for the Maps team, improved load time by 18%." },
    ])
    const [editingExp, setEditingExp] = useState<number | null>(null)

    // Education
    const [educations, setEducations] = useState<Education[]>([
        { id: 1, degree: "B.Tech Computer Science", school: "VIT University", year: "2021 – 2025", grade: "8.9 CGPA" },
    ])
    const [editingEdu, setEditingEdu] = useState<number | null>(null)

    // Skills
    const [skills, setSkills] = useState(["React", "Node.js", "TypeScript", "MongoDB", "Tailwind CSS", "Next.js"])
    const [newSkill, setNewSkill] = useState("")

    // Projects
    const [projects, setProjects] = useState<Project[]>([
        { id: 1, name: "PizzaPalace", desc: "Food delivery app with Razorpay payments, membership tiers, and real-time order tracking.", link: "github.com/sanjay/pizzapalace" },
        { id: 2, name: "Intern Area", desc: "Job & internship platform built with Next.js, Tailwind, and Firebase auth.", link: "github.com/sanjay/internarea" },
    ])
    const [editingProj, setEditingProj] = useState<number | null>(null)

    // Certifications
    const [certs, setCerts] = useState(["AWS Cloud Practitioner", "Meta Frontend Developer"])
    const [newCert, setNewCert] = useState("")

    const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition"

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="max-w-3xl mx-auto px-4 pt-40 max-md:pt-72 pb-16 space-y-5">

                {/* ── Hero card ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Cover */}
                    <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-500 relative">
                        <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-xl px-3 py-1.5 text-xs font-medium transition">
                            Change cover
                        </button>
                    </div>

                    <div className="px-6 pb-6">
                        {/* Avatar */}
                        <div className="flex items-end justify-between -mt-10 mb-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md overflow-hidden">
                                    {avatar
                                        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                        : <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
                                    }
                                </div>
                                <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-lg p-1 cursor-pointer hover:bg-blue-700 transition">
                                    <Pencil size={11} />
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) setAvatar(URL.createObjectURL(f)) }} />
                                </label>
                            </div>
                            <button
                                onClick={() => setEditing(p => !p)}
                                className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition ${editing
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                                {editing ? <><Check size={14} />Save</> : <><Pencil size={14} />Edit</>}
                            </button>
                        </div>

                        {/* Name + title */}
                        {editing ? (
                            <div className="space-y-2 mb-4">
                                <EditField value={name} onChange={setName} placeholder="Full name" className="text-xl font-bold text-gray-900" />
                                <EditField value={title} onChange={setTitle} placeholder="Your title" />
                            </div>
                        ) : (
                            <div className="mb-3">
                                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                                <p className="text-blue-600 font-medium text-sm mt-0.5">{title}</p>
                            </div>
                        )}

                        {/* Bio */}
                        {editing
                            ? <EditField value={bio} onChange={setBio} placeholder="Write a short bio..." multiline className="mb-4" />
                            : <p className="text-sm text-gray-600 leading-relaxed mb-4">{bio}</p>
                        }

                        {/* Contact row */}
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                            {editing ? (
                                <>
                                    <div className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /><EditField value={location} onChange={setLocation} placeholder="Location" /></div>
                                    <div className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" /><EditField value={email} onChange={setEmail} placeholder="Email" /></div>
                                    <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /><EditField value={phone} onChange={setPhone} placeholder="Phone" /></div>
                                    <div className="flex items-center gap-1.5"><Globe size={13} className="text-gray-400" /><EditField value={website} onChange={setWebsite} placeholder="Website" /></div>
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1.5"><MapPin size={13} />{location}</span>
                                    <span className="flex items-center gap-1.5"><Mail size={13} />{email}</span>
                                    <span className="flex items-center gap-1.5"><Phone size={13} />{phone}</span>
                                    <span className="flex items-center gap-1.5"><Globe size={13} />{website}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Experience ── */}
                <Section title="Experience" icon={<Briefcase size={15} />}
                    onAdd={() => {
                        const id = Date.now()
                        setExperiences(p => [...p, { id, role: "", company: "", duration: "", desc: "" }])
                        setEditingExp(id)
                    }} addLabel="Add">
                    <div className="space-y-5">
                        {experiences.map(exp => (
                            <div key={exp.id} className="flex gap-4">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Briefcase size={15} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    {editingExp === exp.id ? (
                                        <div className="space-y-2">
                                            <input value={exp.role} onChange={e => setExperiences(p => p.map(x => x.id === exp.id ? { ...x, role: e.target.value } : x))}
                                                placeholder="Role" className={inputCls} />
                                            <input value={exp.company} onChange={e => setExperiences(p => p.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x))}
                                                placeholder="Company" className={inputCls} />
                                            <input value={exp.duration} onChange={e => setExperiences(p => p.map(x => x.id === exp.id ? { ...x, duration: e.target.value } : x))}
                                                placeholder="Duration (e.g. Jun 2024 – Aug 2024)" className={inputCls} />
                                            <textarea value={exp.desc} onChange={e => setExperiences(p => p.map(x => x.id === exp.id ? { ...x, desc: e.target.value } : x))}
                                                placeholder="Description" className={`${inputCls} resize-none`} rows={3} />
                                            <button onClick={() => setEditingExp(null)}
                                                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                                                <Check size={13} />Done
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{exp.role || "Untitled role"}</p>
                                                    <p className="text-blue-600 text-xs font-medium mt-0.5">{exp.company}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{exp.duration}</p>
                                                    {exp.desc && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.desc}</p>}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button onClick={() => setEditingExp(exp.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Pencil size={13} className="text-gray-400" /></button>
                                                    <button onClick={() => setExperiences(p => p.filter(x => x.id !== exp.id))} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={13} className="text-red-400" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── Education ── */}
                <Section title="Education" icon={<GraduationCap size={15} />}
                    onAdd={() => {
                        const id = Date.now()
                        setEducations(p => [...p, { id, degree: "", school: "", year: "", grade: "" }])
                        setEditingEdu(id)
                    }} addLabel="Add">
                    <div className="space-y-5">
                        {educations.map(edu => (
                            <div key={edu.id} className="flex gap-4">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <GraduationCap size={15} className="text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    {editingEdu === edu.id ? (
                                        <div className="space-y-2">
                                            <input value={edu.degree} onChange={e => setEducations(p => p.map(x => x.id === edu.id ? { ...x, degree: e.target.value } : x))}
                                                placeholder="Degree (e.g. B.Tech Computer Science)" className={inputCls} />
                                            <input value={edu.school} onChange={e => setEducations(p => p.map(x => x.id === edu.id ? { ...x, school: e.target.value } : x))}
                                                placeholder="School / University" className={inputCls} />
                                            <input value={edu.year} onChange={e => setEducations(p => p.map(x => x.id === edu.id ? { ...x, year: e.target.value } : x))}
                                                placeholder="Year (e.g. 2021 – 2025)" className={inputCls} />
                                            <input value={edu.grade} onChange={e => setEducations(p => p.map(x => x.id === edu.id ? { ...x, grade: e.target.value } : x))}
                                                placeholder="CGPA / Percentage" className={inputCls} />
                                            <button onClick={() => setEditingEdu(null)}
                                                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                                                <Check size={13} />Done
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{edu.degree || "Untitled"}</p>
                                                    <p className="text-emerald-600 text-xs font-medium mt-0.5">{edu.school}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{edu.year} {edu.grade && `· ${edu.grade}`}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button onClick={() => setEditingEdu(edu.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Pencil size={13} className="text-gray-400" /></button>
                                                    <button onClick={() => setEducations(p => p.filter(x => x.id !== edu.id))} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={13} className="text-red-400" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── Skills ── */}
                <Section title="Skills" icon={<Star size={15} />}>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map(s => (
                            <SkillTag key={s} label={s} onRemove={() => setSkills(p => p.filter(x => x !== s))} />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill("") } }}
                            placeholder="Add a skill and press Enter" className={inputCls} />
                        <button onClick={() => { if (newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill("") } }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl text-sm font-medium transition shrink-0">
                            Add
                        </button>
                    </div>
                </Section>

                {/* ── Projects ── */}
                <Section title="Projects" icon={<Briefcase size={15} />}
                    onAdd={() => {
                        const id = Date.now()
                        setProjects(p => [...p, { id, name: "", desc: "", link: "" }])
                        setEditingProj(id)
                    }} addLabel="Add">
                    <div className="space-y-4">
                        {projects.map(proj => (
                            <div key={proj.id} className="border border-gray-100 rounded-xl p-4 group hover:border-blue-100 transition">
                                {editingProj === proj.id ? (
                                    <div className="space-y-2">
                                        <input value={proj.name} onChange={e => setProjects(p => p.map(x => x.id === proj.id ? { ...x, name: e.target.value } : x))}
                                            placeholder="Project name" className={inputCls} />
                                        <textarea value={proj.desc} onChange={e => setProjects(p => p.map(x => x.id === proj.id ? { ...x, desc: e.target.value } : x))}
                                            placeholder="Description" className={`${inputCls} resize-none`} rows={2} />
                                        <input value={proj.link} onChange={e => setProjects(p => p.map(x => x.id === proj.id ? { ...x, link: e.target.value } : x))}
                                            placeholder="GitHub / Live link" className={inputCls} />
                                        <button onClick={() => setEditingProj(null)}
                                            className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded-lg transition">
                                            <Check size={13} />Done
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{proj.name || "Untitled"}</p>
                                            {proj.desc && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{proj.desc}</p>}
                                            {proj.link && <a href={`https://${proj.link}`} target="_blank" rel="noreferrer"
                                                className="text-xs text-blue-500 hover:underline mt-1 block">{proj.link}</a>}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => setEditingProj(proj.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Pencil size={13} className="text-gray-400" /></button>
                                            <button onClick={() => setProjects(p => p.filter(x => x.id !== proj.id))} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={13} className="text-red-400" /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── Certifications ── */}
                <Section title="Certifications" icon={<Award size={15} />}>
                    <div className="space-y-2 mb-4">
                        {certs.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 group">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <Award size={12} className="text-amber-600" />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">{c}</span>
                                </div>
                                <button onClick={() => setCerts(p => p.filter((_, j) => j !== i))}
                                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded-lg">
                                    <Trash2 size={13} className="text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newCert} onChange={e => setNewCert(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && newCert.trim()) { setCerts(p => [...p, newCert.trim()]); setNewCert("") } }}
                            placeholder="Add certification and press Enter" className={inputCls} />
                        <button onClick={() => { if (newCert.trim()) { setCerts(p => [...p, newCert.trim()]); setNewCert("") } }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl text-sm font-medium transition shrink-0">
                            Add
                        </button>
                    </div>
                </Section>

            </main>
        </div>
    )
}

export default User_Profile