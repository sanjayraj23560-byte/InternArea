'use client'
import { BriefcaseBusiness, ChevronDown, Home, SearchIcon, LogOut, FileText, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CgGoogle } from "react-icons/cg";
import { useRouter } from "next/navigation";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./Firebase";

interface UserState {
    name: string
    photo: string
    email: string
}

const Navbar = () => {
    const router = useRouter()
    const [interns_Dropdown, setIntern_DropDown] = useState(false)
    const [job_Dropdown, setJob_DropDown] = useState(false)
    const [toast, setToast] = useState<string | null>(null)
    const [user, setUser] = useState<UserState | null>(null)
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    // ✅ Persist auth state across refreshes
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

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const Handle_GoogleIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            showToast(`Welcome, ${result.user.displayName}!`)
            setTimeout(() => router.push('/'), 1000);
        } catch (err) {
            console.error(err)
            showToast("Sign in failed. Please try again.")
        }
    }

    const Handle_SignOut = async () => {
        try {
            await signOut(auth)
            setProfileOpen(false)
            showToast("Signed out successfully")
        } catch (err) {
            console.error(err)
        }
    }

    const profileMenu = [
        { icon: <User size={15} />, label: "My Profile", path: "/userprofile" },
        { icon: <FileText size={15} />, label: "My Applications", path: "/userapplications" },
        { icon: <Settings size={15} />, label: "Settings", path: "/settings" },
    ]

    const ProfileDropdown = () => (
        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <img src={user!.photo} alt={user!.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-200" />
                <div className="overflow-hidden">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user!.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user!.email}</p>
                </div>
            </div>
            {profileMenu.map(item => (
                <button key={item.label}
                    onClick={() => { router.push(item.path); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                    {item.icon}{item.label}
                </button>
            ))}
            <div className="border-t border-gray-100 mt-1">
                <button onClick={Handle_SignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                    <LogOut size={15} />Sign Out
                </button>
            </div>
        </div>
    )

    return (
        <nav className="m-3 rounded-2xl bg-white shadow-xl px-4 py-3 fixed left-0 right-0 top-0 z-50">

            {/* ── Toast ── */}
            {toast && (
                <div className="absolute right-4 top-16 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
                    {toast}
                </div>
            )}

            {/* ── Row 1 ── */}
            <div className="flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="bg-blue-100 p-2 rounded-xl">
                        <BriefcaseBusiness className="text-blue-600" size={20} />
                    </div>
                    <span className="text-lg font-bold text-blue-600">Intern Area</span>
                </div>

                {/* Desktop: Home link */}
                <div className="hidden lg:flex items-center gap-1 cursor-pointer text-gray-600 hover:text-blue-600 transition text-sm font-medium"
                    onClick={() => router.push('/')}>
                    <Home size={16} /><span>Home</span>
                </div>

                {/* ── Mobile buttons ── */}
                <div className="flex items-center gap-2 lg:hidden">
                    <button onClick={() => router.push('/internship')}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 transition">
                        Internships
                    </button>
                    <button onClick={() => router.push('/jobs')}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 transition">
                        Jobs
                    </button>

                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-1">
                                <img src={user.photo} alt={user.name}
                                    className="w-7 h-7 rounded-full object-cover border-2 border-blue-200" />
                                <ChevronDown size={13} className="text-gray-500" />
                            </button>
                            {profileOpen && <ProfileDropdown />}
                        </div>
                    ) : (
                        <>
                            <button onClick={Handle_GoogleIn}
                                className="flex items-center gap-1 border border-gray-300 rounded-xl px-2 py-1.5 text-xs hover:bg-gray-50 transition">
                                <CgGoogle size={14} />
                            </button>
                            <button className="bg-gray-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-gray-800 transition"
                                onClick={() => router.push('/adminlogin')}>
                                Admin
                            </button>
                        </>
                    )}
                </div>

                {/* ── Desktop nav links ── */}
                <div className="hidden lg:flex items-center gap-6 text-gray-700 font-medium">
                    <div className="relative">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition"
                            onClick={() => { setIntern_DropDown(p => !p); setJob_DropDown(false) }}>
                            Internships <ChevronDown size={16} />
                        </button>
                        {interns_Dropdown && (
                            <div className="absolute top-8 left-0 w-44 bg-white shadow-2xl rounded-xl py-2 z-50 flex flex-col">
                                {["Full Stack", "Frontend", "Backend", "UI/UX", "Data Science"].map(item => (
                                    <span key={item}
                                        onClick={() => { router.push('/internship'); setIntern_DropDown(false) }}
                                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button className="flex items-center gap-1 hover:text-blue-600 transition"
                            onClick={() => { setJob_DropDown(p => !p); setIntern_DropDown(false) }}>
                            Jobs <ChevronDown size={16} />
                        </button>
                        {job_Dropdown && (
                            <div className="absolute top-8 left-0 w-44 bg-white shadow-2xl rounded-xl py-2 z-50 flex flex-col">
                                {["Full Time", "Part Time", "Remote", "Hybrid"].map(item => (
                                    <span key={item}
                                        onClick={() => { router.push('/jobs'); setJob_DropDown(false) }}
                                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Desktop search + auth ── */}
                <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-2xl px-3 py-2 w-64">
                        <SearchIcon size={16} className="text-gray-400" />
                        <input className="w-full outline-none text-sm" type="text" placeholder="Search internships..." />
                    </div>

                    {user ? (
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-2 border border-gray-200 rounded-2xl px-3 py-1.5 hover:bg-gray-50 transition">
                                <img src={user.photo} alt={user.name}
                                    className="w-7 h-7 rounded-full object-cover border-2 border-blue-200" />
                                <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                                    {user.name.split(" ")[0]}
                                </span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                            {profileOpen && <ProfileDropdown />}
                        </div>
                    ) : (
                        <>
                            <button onClick={Handle_GoogleIn}
                                className="flex items-center gap-2 border border-gray-300 rounded-2xl px-3 py-2 hover:bg-gray-50 transition text-sm">
                                <CgGoogle size={18} /><span className="font-medium">Google</span>
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-4 py-2 text-sm font-semibold transition"
                                onClick={() => router.push('/register')}>
                                Register
                            </button>
                            <button className="bg-gray-700 hover:bg-gray-800 text-white rounded-2xl px-4 py-2 text-sm font-semibold transition"
                                onClick={() => router.push('/adminlogin')}>
                                Admin
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Mobile search ── */}
            <div className="lg:hidden mt-3">
                Settings
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                    <SearchIcon size={15} className="text-gray-400" />
                    <input className="w-full outline-none text-sm" type="text" placeholder="Search internships..." />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;