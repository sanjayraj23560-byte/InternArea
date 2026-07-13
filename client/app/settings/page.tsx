'use client'
import { auth } from '@/components/Firebase'
import React, { useEffect, useState } from 'react'
import { User2, Bell, Settings2, Globe, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { onAuthStateChanged, signOut } from "firebase/auth";

function Settings() {
    const router = useRouter()
    const [name, setname] = useState('login bro')
    const [page, Setpage] = useState(true)
    const [email, setEmail] = useState('login@gmail.com')

    useEffect(() => {
        if (!auth) {
            router.push('/')
            toast.info("Please login")
            Setpage(false)
        }
        else {
            Setpage(true)
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

            if (currentUser) {
                setname(currentUser.displayName ?? "")
                setEmail(currentUser.email ?? "")
            }

        });

        return () => unsubscribe();

    }, []);
    const [notifications, setNotifications] = useState(true)

    return (<>
        <div className="min-h-screen bg-gray-100 py-10 px-5 mt-30">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        ← Back
                    </button>


                    <div className='flex gap-3'>

                        <Settings2 size={18} /><span> Settings</span>

                    </div>
                </div>

                <div className="space-y-6">

                    {/* Profile */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-5">
                            <User2 size={18} /> Profile
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <label className="block mb-2 font-medium">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => (e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-medium">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="w-full border rounded-lg px-4 py-2 bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-5">
                            <Globe size={18} /> Language
                        </h2>
                        <LanguageSwitcher />
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-5">
                            <Bell size={18} /> Notifications
                        </h2>

                        <div className="flex items-center justify-between">

                            <span>Email Notifications</span>

                            <input
                                type="checkbox"
                                checked={notifications}
                                onChange={() => setNotifications(!notifications)}
                                className="w-5 h-5"
                            />

                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-5">
                            <Lock size={18} /> Security
                        </h2>

                        <div className="flex flex-col gap-3">

                            <button onClick={() => router.push('/forgot-password')} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                Change Password
                            </button>

                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                    </div>

                </div>

            </div>

        </div></>
    )
}

export default Settings