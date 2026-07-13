'use client'
import React, { useEffect, useState } from 'react'
import axios from "axios";
import { Pencil, Save, Plus, Trash2, X, MapPin, Mail, Phone, Globe, Briefcase, GraduationCap, FileText, Star, Award, Users, Calendar, Image, Film, Check } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "@/components/Firebase";
import { useLanguage } from "@/context/LanguageContext";

interface Experience { id: number; role: string; company: string; duration: string; desc: string; }
interface Education { id: number; degree: string; school: string; year: string; grade: string; }
interface Project { id: number; name: string; desc: string; link: string; }
interface NetworkConnection { connectionId: string; peerId: string; name: string; photo: string; connectedAt: string; }
interface UserPost { _id: string; caption: string; mediaUrl: string; mediaType: "image" | "video"; createdAt: string; }

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 transition text-gray-800 bg-white";

export default function User_Profile() {
    const { t } = useLanguage();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("fill out");
    const [title, setTitle] = useState("fill out");
    const [location, setLocation] = useState("fill out");
    const [email, setEmail] = useState("fill out");
    const [phone, setPhone] = useState("+XX XXXXXXX");
    const [website, setWebsite] = useState("fill out.dev");
    const [bio, setBio] = useState(
        "Passionate developer building impactful products. Open to internships and full-time roles."
    );
    const [avatar, setAvatar] = useState("");

    const [experiences, setExperiences] = useState<Experience[]>([
        {
            id: 1,
            role: "Intern / Job ",
            company: "Ex;-fill out",
            duration: "fill out",
            desc: "Built React components and improved performance.",
        },
    ]);

    const [educations, setEducations] = useState<Education[]>([
        {
            id: 1,
            degree: "Ex;-B.tech",
            school: "College / University",
            year: "2024 – 2027",
            grade: "Current position",
        },
    ]);

    const [skills, setSkills] = useState(["React"]);
    const [newSkill, setNewSkill] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [certs, setCerts] = useState(["Add Certifications"]);
    const [newCert, setNewCert] = useState("");

    const [connections, setConnections] = useState<NetworkConnection[]>([]);
    const [myPosts, setMyPosts] = useState<UserPost[]>([]);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editCaptionText, setEditCaptionText] = useState<string>("");

    const handleSave = async () => {
        setSaving(true);
        try {
            const user = auth.currentUser;
            const profileInfo = {
                uid: user?.uid, name, title, location, email, phone, website, bio, avatar, skills, experiences, educations, projects, certs,
            };
            // FIX: was posting to /api/profile/info, but the actual route is
            // POST /api/profile/save (the one that upserts on uid)
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/save`, profileInfo);
            console.log(res);
            toast.success(t('profile.successSave') || "Profile saved successfully!");
            setEditing(false);
        } catch (err) {
            console.log("Error", err);
            toast.error(t('profile.failedSave') || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const fetchProfileData = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            // FIX: was GET /api/profile/${uid} (path param); the actual route
            // is GET /api/profile with uid as a query param
            const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                params: { uid: user.uid }
            });
            // FIX: the route wraps the doc as { data: profile }, so this needs
            // one more level of unwrapping than before (was just profileRes.data)
            const p = profileRes.data.data;
            setName(p.name || "");
            setTitle(p.title || "");
            setLocation(p.location || "");
            setEmail(p.email || "");
            setPhone(p.phone || "");
            setWebsite(p.website || "");
            setBio(p.bio || "");
            setAvatar(p.avatar || "");
            setSkills(p.skills || []);
            setExperiences(p.experiences || []);
            setEducations(p.educations || []);
            setProjects(p.projects || []);
            setCerts(p.certs || []);
        } catch {
            // No profile saved yet (route returns 404) — keep the placeholder
            // defaults from useState above so first-time users see "fill out"
            // hints instead of a blank/broken page.
        }

        try {
            const networkRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/engagerequest/my-network`, {
                params: { userId: user.uid }
            });
            setConnections(networkRes.data);
        } catch (err) {
            console.error(err);
        }

        try {
            const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/communitypost/user-posts`, {
                params: { userId: user.uid }
            });
            setMyPosts(postsRes.data);
        } catch (err) {
            console.error("Failed to sync personal uploads feed", err);
        }
    };

    const handleUpdatePostCaption = async (postId: string) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/communitypost/${postId}`, {
                caption: editCaptionText,
                userId: user.uid
            });
            setMyPosts((prev) => prev.map((p) => p._id === postId ? { ...p, caption: editCaptionText } : p));
            setEditingPostId(null);
            toast.success("Post updated!");
        } catch (err) {
            toast.error("Failed to save update details");
        }
    };

    const handleDeletePost = async (postId: string) => {
        const user = auth.currentUser;
        if (!user) return;
        if (!confirm("Are you sure you want to permanently delete this post?")) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/communitypost/${postId}`, {
                params: { userId: user.uid }
            });
            setMyPosts((prev) => prev.filter((p) => p._id !== postId));
            toast.success("Post deleted safely.");
        } catch (err) {
            toast.error("Failed to delete this post.");
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchProfileData();
        });
        return () => unsubscribe();
    }, []);

    const handleUniversalButton = () => {
        if (editing) handleSave();
        else setEditing(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 pt-40 max-md:pt-72 pb-16">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="h-32 bg-linear-to-rrom-blue-600 to-indigo-500" />

                    <div className="p-6 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 -mt-16">
                            <div className="flex items-end gap-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden shadow-md">
                                        {avatar ? (
                                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
                                        )}
                                    </div>
                                    {editing && (
                                        <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-lg p-1.5 cursor-pointer">
                                            <Pencil size={13} />
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setAvatar(URL.createObjectURL(file));
                                            }} />
                                        </label>
                                    )}
                                </div>

                                <div>
                                    {editing ? (
                                        <div className="space-y-2">
                                            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} text-lg font-bold bg-white border-2 border-blue-600`} placeholder="Full name" />
                                            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Title" />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                                            <p className="text-blue-600 font-medium">{title}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button onClick={handleUniversalButton} disabled={saving} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition text-sm">
                                {editing ? <Save size={16} /> : <Pencil size={16} />}
                                {editing ? (saving ? t('profile.saving') || "Saving..." : t('profile.saveProfile') || "Save Profile") : t('profile.editProfile') || "Edit Profile"}
                            </button>
                        </div>

                        {/* About Area Block */}
                        <div>
                            <h2 className="font-semibold text-gray-900 mb-2">{t('profile.aboutTitle') || "About"}</h2>
                            {editing ? (
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputCls} resize-none`} rows={4} placeholder={t('profile.writeAbout') || "Write about yourself..."} />
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
                            )}
                        </div>

                        {/* Contact Form Elements */}
                        <div>
                            <h2 className="font-semibold text-gray-900 mb-3">{t('profile.contactTitle') || "Contact Information"}</h2>
                            {editing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Location" />
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="Email" />
                                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="Phone" />
                                    <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} placeholder="Website" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                    <p className="flex items-center gap-2"><MapPin size={15} /> {location}</p>
                                    <p className="flex items-center gap-2"><Mail size={15} /> {email}</p>
                                    <p className="flex items-center gap-2"><Phone size={15} /> {phone}</p>
                                    <p className="flex items-center gap-2"><Globe size={15} /> {website}</p>
                                </div>
                            )}
                        </div>

                        {/* Skills Management Grid Deck */}
                        <div>
                            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Star size={16} /> {t('profile.skillsTitle') || "Skills"}</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {skills.map((skill) => (
                                    <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                        {skill}
                                        {editing && (
                                            <button onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}><X size={11} /></button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {editing && (
                                <div className="flex gap-2">
                                    <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className={inputCls} placeholder={t('profile.addSkillPlaceholder') || "Add skill"} />
                                    <button onClick={() => {
                                        if (!newSkill.trim()) return;
                                        setSkills((prev) => [...prev, newSkill.trim()]);
                                        setNewSkill("");
                                    }} className="bg-blue-600 text-white px-4 rounded-xl text-sm">{t('profile.addBtn') || "Add"}</button>
                                </div>
                            )}
                        </div>

                        {/* Experiences Sub-grid Loop */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Briefcase size={16} /> {t('profile.experienceTitle') || "Experience"}</h2>
                                {editing && (
                                    <button onClick={() => setExperiences((prev) => [...prev, { id: Date.now(), role: "", company: "", duration: "", desc: "" }])} className="text-blue-600 text-sm flex items-center gap-1"><Plus size={14} /> {t('profile.addBtn') || "Add"}</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {experiences.map((exp) => (
                                    <div key={exp.id} className="border border-gray-100 rounded-2xl p-4">
                                        {editing ? (
                                            <div className="space-y-2">
                                                <input value={exp.role} onChange={(e) => setExperiences((prev) => prev.map((x) => x.id === exp.id ? { ...x, role: e.target.value } : x))} className={inputCls} placeholder="Role" />
                                                <input value={exp.company} onChange={(e) => setExperiences((prev) => prev.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x))} className={inputCls} placeholder="Company" />
                                                <input value={exp.duration} onChange={(e) => setExperiences((prev) => prev.map((x) => x.id === exp.id ? { ...x, duration: e.target.value } : x))} className={inputCls} placeholder="Duration" />
                                                <textarea value={exp.desc} onChange={(e) => setExperiences((prev) => prev.map((x) => x.id === exp.id ? { ...x, desc: e.target.value } : x))} className={`${inputCls} resize-none`} rows={3} placeholder="Description" />
                                                <button onClick={() => setExperiences((prev) => prev.filter((x) => x.id !== exp.id))} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={13} /> {t('profile.removeBtn') || "Remove"}</button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-900">{exp.role}</p>
                                                <p className="text-blue-600 text-sm">{exp.company}</p>
                                                <p className="text-xs text-gray-400">{exp.duration}</p>
                                                <p className="text-sm text-gray-600 mt-2">{exp.desc}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education Layout Framework */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><GraduationCap size={16} /> {t('profile.educationTitle') || "Education"}</h2>
                                {editing && (
                                    <button onClick={() => setEducations((prev) => [...prev, { id: Date.now(), degree: "", school: "", year: "", grade: "" }])} className="text-blue-600 text-sm flex items-center gap-1"><Plus size={14} /> {t('profile.addBtn') || "Add"}</button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {educations.map((edu) => (
                                    <div key={edu.id} className="border border-gray-100 rounded-2xl p-4">
                                        {editing ? (
                                            <div className="space-y-2">
                                                <input value={edu.degree} onChange={(e) => setEducations((prev) => prev.map((x) => x.id === edu.id ? { ...x, degree: e.target.value } : x))} className={inputCls} placeholder="Degree" />
                                                <input value={edu.school} onChange={(e) => setEducations((prev) => prev.map((x) => x.id === edu.id ? { ...x, school: e.target.value } : x))} className={inputCls} placeholder="School / University" />
                                                <input value={edu.year} onChange={(e) => setEducations((prev) => prev.map((x) => x.id === edu.id ? { ...x, year: e.target.value } : x))} className={inputCls} placeholder="Year" />
                                                <input value={edu.grade} onChange={(e) => setEducations((prev) => prev.map((x) => x.id === edu.id ? { ...x, grade: e.target.value } : x))} className={inputCls} placeholder="Grade / CGPA" />
                                                <button onClick={() => setEducations((prev) => prev.filter((x) => x.id !== edu.id))} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={13} /> {t('profile.removeBtn') || "Remove"}</button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-900">{edu.degree}</p>
                                                <p className="text-emerald-600 text-sm">{edu.school}</p>
                                                <p className="text-xs text-gray-400">{edu.year} {edu.grade && `· ${edu.grade}`}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects Deck Grid List */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Briefcase size={16} /> {t('profile.projectsTitle') || "Projects"}</h2>
                                {editing && (
                                    <button onClick={() => setProjects((prev) => [...prev, { id: Date.now(), name: "", desc: "", link: "" }])} className="text-blue-600 text-sm flex items-center gap-1"><Plus size={14} /> {t('profile.addBtn') || "Add"}</button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {projects.map((project) => (
                                    <div key={project.id} className="border border-gray-100 rounded-2xl p-4">
                                        {editing ? (
                                            <div className="space-y-2">
                                                <input value={project.name} onChange={(e) => setProjects((prev) => prev.map((x) => x.id === project.id ? { ...x, name: e.target.value } : x))} className={inputCls} placeholder="Project name" />
                                                <textarea value={project.desc} onChange={(e) => setProjects((prev) => prev.map((x) => x.id === project.id ? { ...x, desc: e.target.value } : x))} className={`${inputCls} resize-none`} rows={3} placeholder="Description" />
                                                <input value={project.link} onChange={(e) => setProjects((prev) => prev.map((x) => x.id === project.id ? { ...x, link: e.target.value } : x))} className={inputCls} placeholder="GitHub / Live link" />
                                                <button onClick={() => setProjects((prev) => prev.filter((x) => x.id !== project.id))} className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={13} /> {t('profile.removeBtn') || "Remove"}</button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-gray-900">{project.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">{project.desc}</p>
                                                {project.link && (
                                                    <a href={project.link.startsWith("http") ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">{project.link}</a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certifications Row Loops */}
                        <div>
                            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Award size={16} /> {t('profile.certificationsTitle') || "Certifications"}</h2>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {certs.map((cert) => (
                                    <span key={cert} className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                        {cert}
                                        {editing && (
                                            <button onClick={() => setCerts((prev) => prev.filter((c) => c !== cert))}><X size={11} /></button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {editing && (
                                <div className="flex gap-2">
                                    <input value={newCert} onChange={(e) => setNewCert(e.target.value)} className={inputCls} placeholder={t('profile.addCertPlaceholder') || "Add certification"} />
                                    <button onClick={() => {
                                        if (!newCert.trim()) return;
                                        setCerts((prev) => [...prev, newCert.trim()]);
                                        setNewCert("");
                                    }} className="bg-blue-600 text-white px-4 rounded-xl text-sm">{t('profile.addBtn') || "Add"}</button>
                                </div>
                            )}
                        </div>

                        {/* Personal Posts Feed Loop Container */}
                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-indigo-600" />
                                <span>{t('profile.myUploads') || "My Uploads Feed"} ({myPosts.length})</span>
                            </h2>
                            {myPosts.length === 0 ? (
                                <p className="text-sm text-gray-400 bg-gray-50 border rounded-2xl p-4 text-center">{t('profile.noUpdates') || "You haven't shared any updates yet."}</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myPosts.map((post) => (
                                        <div key={post._id} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex flex-col gap-3">
                                            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    {post.mediaType === "video" ? <Film size={12} /> : <Image size={12} />}
                                                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {editingPostId === post._id ? (
                                                        <button onClick={() => handleUpdatePostCaption(post._id)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
                                                            <Check size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => { setEditingPostId(post._id); setEditCaptionText(post.caption); }} className="p-1.5 text-gray-500 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition">
                                                            <Pencil size={14} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeletePost(post._id)} className="p-1.5 text-gray-400 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-500 transition">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {editingPostId === post._id ? (
                                                <textarea value={editCaptionText} onChange={(e) => setEditCaptionText(e.target.value)} className={`${inputCls} resize-none text-xs`} rows={2} />
                                            ) : (
                                                <p className="text-xs text-gray-600 font-medium line-clamp-2 min-h-8">{post.caption || t('profile.noDesc') || "No description provided."}</p>
                                            )}

                                            <div className="bg-gray-50 border rounded-xl overflow-hidden h-36 w-full flex items-center justify-center">
                                                {post.mediaType === "video" ? (
                                                    <video src={post.mediaUrl} className="h-full w-full object-cover" />
                                                ) : (
                                                    <img src={post.mediaUrl} alt="upload thumbnail" className="h-full w-full object-cover" loading="lazy" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Network Connection Loop Grid Elements */}
                        {connections.length > 0 && (
                            <div className="pt-6 border-t border-gray-100">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={16} className="text-blue-600" />
                                    <span>{t('profile.myNetwork') || "My Network"} ({connections.length})</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {connections.map((conn) => (
                                        <div key={conn.connectionId} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:border-blue-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {conn.photo ? (
                                                    <img src={conn.photo} alt={conn.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center uppercase text-sm">
                                                        {conn.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-990 capitalize text-gray-900">{conn.name}</h4>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} className="text-gray-300" />
                                                        <span>{t('profile.connectedOn') || "Connected"} {new Date(conn.connectedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}