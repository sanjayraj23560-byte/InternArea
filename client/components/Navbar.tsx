'use client'
import { BriefcaseBusiness, ChevronDown, Home, SearchIcon, LogOut, FileText, Settings, User, Camera, Users, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CgGoogle } from "react-icons/cg";
import { useRouter } from "next/navigation";
import { GemIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./Firebase";
import { toast } from "react-toastify";

interface UserState {
    name: string
    photo: string
    email: string
}

interface ProfileMenuitem {
    icon: React.ReactNode
    label: string
    path: string
    accent?: string // tailwind bg/text classes for the icon badge
}

const ProfileDropdown = ({
    user,
    profileMenu,
    onNavigate,
    onSignOut
}: {
    user: UserState
    profileMenu: ProfileMenuitem[]
    onNavigate: (path: string) => void
    onSignOut: () => void
}) => (
    <div className="absolute right-0 top-12 w-80 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <img
                src={user.photo || "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shrink-0"
            />
            <div className="overflow-hidden">
                <p className="font-semibold text-gray-900 text-base truncate">{user.name}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
        </div>

        <div className="py-1.5">
            {profileMenu.map(item => (
                <button
                    key={item.label}
                    onClick={() => onNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-blue-50 transition text-left group"
                >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${item.accent || 'bg-gray-50 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        {item.icon}
                    </span>
                    <span className="font-medium text-gray-700 group-hover:text-blue-600 transition">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="border-t border-gray-100 pt-1.5">
            <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition text-left group"
            >
                <span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <LogOut size={16} />
                </span>
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
    </div>
)

const Navbar = () => {
    const { t } = useLanguage();
    const router = useRouter()
    const [interns_Dropdown, setIntern_DropDown] = useState(false)
    const [job_Dropdown, setJob_DropDown] = useState(false)
    const [user, setUser] = useState<UserState | null>(null)
    const [profileOpen, setProfileOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const mobileProfileRef = useRef<HTMLDivElement>(null)
    const [prevGlogin, SetPrevGLogin] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    name: firebaseUser.displayName || "User",
                    photo: firebaseUser.photoURL || "",
                    email: firebaseUser.email || ""
                })
            } else {
                setUser(null)
            }
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const clickedOutsideDesktop = profileRef.current && !profileRef.current.contains(e.target as Node)
            const clickedOutsideMobile = mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node)
            if (clickedOutsideDesktop && clickedOutsideMobile) {
                setProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Close the mobile menu automatically when switching to a wider viewport
    // (e.g. rotating a tablet, or resizing a browser window past the lg
    // breakpoint) so it doesn't stay stuck open behind the desktop nav.
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileMenuOpen(false)
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const Handle_GoogleIn = async () => {
        SetPrevGLogin(false)
        setTimeout(() => SetPrevGLogin(true), 6000)
        try {
            const result = await signInWithPopup(auth, provider)
            toast.success(`Welcome back, ${result.user.displayName}!`)
            setMobileMenuOpen(false)
            setTimeout(() => router.push('/'), 1000)
        } catch (err) {
            console.error(err)
            toast.error("Sign in failed. Please try again.")
        }
    }

    const Handle_SignOut = async () => {
        try {
            await signOut(auth)
            setProfileOpen(false)
            setMobileMenuOpen(false)
            toast.success("Signed out successfully.")
        } catch (err) {
            console.error(err)
            toast.error("Error signing out.")
        }
    }

    const handleNavigate = (path: string) => {
        setProfileOpen(false)
        setMobileMenuOpen(false)
        router.push(path)
    }

    const profileMenu: ProfileMenuitem[] = [
        { icon: <User size={16} />, label: "My Profile", path: "/userprofile", accent: "bg-blue-50 text-blue-600" },
        { icon: <Users size={16} />, label: "Engage Requests", path: "/requests", accent: "bg-sky-50 text-sky-600" },
        { icon: <FileText size={16} />, label: "My Applications", path: "/userapplications", accent: "bg-emerald-50 text-emerald-600" },
        { icon: <GemIcon size={16} />, label: "Upgrade 💎", path: '/membership', accent: "bg-purple-50 text-purple-600" },
        { icon: <GemIcon size={16} />, label: "AI Resume", path: "/buildresume", accent: "bg-indigo-50 text-indigo-600" },
        { icon: <Camera size={16} />, label: "Upload a Post", path: "/posts", accent: "bg-pink-50 text-pink-600" },
        { icon: <Settings size={16} />, label: "Settings", path: "/settings", accent: "bg-gray-100 text-gray-600" },
    ]

    return (
        <nav className="m-3 rounded-2xl bg-white shadow-xl px-4 py-3 fixed left-0 right-0 top-0 z-50">
            <div className="flex items-center justify-between gap-2">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => router.push('/')}>
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <BriefcaseBusiness className="text-blue-600" size={20} />
                    </div>
                    <span className="text-lg font-bold text-blue-600 hidden sm:inline">Intern Area</span>
                </div>

                {/* ── Desktop nav links ── */}
                <div className="hidden lg:flex items-center gap-6 text-gray-700 font-medium">
                    <div
                        className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition text-sm"
                        onClick={() => router.push('/')}
                    >
                        <Home size={16} /><span>{t('nav.home')}</span>
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-1 hover:text-blue-600 transition"
                            onClick={() => { setIntern_DropDown(p => !p); setJob_DropDown(false) }}
                        >
                            {t('nav.internships')} <ChevronDown size={16} />
                        </button>
                        {interns_Dropdown && (
                            <div className="absolute top-8 left-0 w-44 bg-white shadow-2xl rounded-xl py-2 z-50 flex flex-col">
                                {["Full Stack", "Frontend", "Backend", "UI/UX", "Data Science"].map(item => (
                                    <span
                                        key={item}
                                        onClick={() => { router.push('/internship'); setIntern_DropDown(false) }}
                                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-1 hover:text-blue-600 transition"
                            onClick={() => { setJob_DropDown(p => !p); setIntern_DropDown(false) }}
                        >
                            {t('nav.jobs')} <ChevronDown size={16} />
                        </button>
                        {job_Dropdown && (
                            <div className="absolute top-8 left-0 w-44 bg-white shadow-2xl rounded-xl py-2 z-50 flex flex-col">
                                {["Full Time", "Part Time", "Remote", "Hybrid"].map(item => (
                                    <span
                                        key={item}
                                        onClick={() => { router.push('/jobs'); setJob_DropDown(false) }}
                                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-sm"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="cursor-pointer hover:text-blue-600 transition" onClick={() => router.push('/community')}>
                        {t('nav.community')}
                    </div>
                </div>

                {/* ── Desktop: search + language + auth ── */}
                <div className="hidden lg:flex items-center gap-3">
                    <LanguageSwitcher />

                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-1.5 hover:bg-gray-50 transition"
                            >
                                <img
                                    src={user.photo || "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-200"
                                />
                                <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                                    {user.name.split(" ")[0]}
                                </span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                            {profileOpen && (
                                <ProfileDropdown
                                    user={user}
                                    profileMenu={profileMenu}
                                    onNavigate={handleNavigate}
                                    onSignOut={Handle_SignOut}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            {prevGlogin && (
                                <button
                                    onClick={Handle_GoogleIn}
                                    className="flex items-center gap-2 border border-gray-300 rounded-2xl px-3 py-2 hover:bg-gray-50 transition text-sm"
                                >
                                    <CgGoogle size={18} /><span className="font-medium">Google</span>
                                </button>
                            )}
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-2 text-sm font-semibold transition"
                                onClick={() => router.push('/register')}
                            >
                                Register
                            </button>
                            <button
                                className="bg-gray-700 hover:bg-gray-800 text-white rounded-2xl px-4 py-2 text-sm font-semibold transition"
                                onClick={() => router.push('/adminlogin')}
                            >
                                Admin
                            </button>
                        </>
                    )}
                </div>

                {/* ── Mobile: compact right-side controls ── */}
                <div className="flex items-center gap-2 lg:hidden">
                    {user && (
                        <div className="relative" ref={mobileProfileRef}>
                            <button
                                onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-1"
                            >
                                <img
                                    src={user.photo || "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                                />
                            </button>
                            {profileOpen && (
                                <ProfileDropdown
                                    user={user}
                                    profileMenu={profileMenu}
                                    onNavigate={handleNavigate}
                                    onSignOut={Handle_SignOut}
                                />
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(p => !p)}
                        aria-label="Toggle menu"
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile search (always visible below the top row) ── */}
            <div className="lg:hidden mt-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <SearchIcon size={15} className="text-gray-400" />
                    <input
                        className="w-full outline-none text-sm"
                        type="text"
                        placeholder="Search internships..."
                    />
                </div>
            </div>

            {/* ── Mobile dropdown menu ── */}
            {mobileMenuOpen && (
                <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
                    <button
                        onClick={() => handleNavigate('/')}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                        <Home size={16} /> {t('nav.home')}
                    </button>
                    <button
                        onClick={() => handleNavigate('/internship')}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                        <BriefcaseBusiness size={16} /> {t('nav.internships')}
                    </button>
                    <button
                        onClick={() => handleNavigate('/jobs')}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                        <BriefcaseBusiness size={16} /> {t('nav.jobs')}
                    </button>
                    <button
                        onClick={() => handleNavigate('/community')}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                        <Users size={16} /> {t('nav.community')}
                    </button>

                    <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Language</span>
                        <LanguageSwitcher />
                    </div>

                    {!user && (
                        <div className="flex flex-col gap-2 px-3 pt-2 border-t border-gray-100 mt-1">
                            {prevGlogin && (
                                <button
                                    onClick={Handle_GoogleIn}
                                    className="flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition text-sm"
                                >
                                    <CgGoogle size={16} /><span className="font-medium">Continue with Google</span>
                                </button>
                            )}
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                                onClick={() => handleNavigate('/register')}
                            >
                                Register
                            </button>
                            <button
                                className="bg-gray-700 hover:bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                                onClick={() => handleNavigate('/adminlogin')}
                            >
                                Admin
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar;