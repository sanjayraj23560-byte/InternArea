'use client'

import React, { useState } from 'react'
import { BiLeftArrowAlt } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import { toast } from "react-toastify";
import axios from 'axios';

function AdminLogin() {
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const route = useRouter()
    const [formadata, setformadata] = useState({
        username: "",
        password: "",
    });
    const router = useRouter();
    const [isloading, setisloading] = useState(false);
    const handlechange = (e: any) => {
        const { name, value } = e.target;
        setformadata((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlesubmit = async (e: React.FormEvent) => {

        if (!formadata.username || !formadata.password) {
            toast.error("Please fill all fields");
            return;
        }

        e.preventDefault();
        if (!formadata.username || !formadata.password) {
            toast.error("Please fill in all detials");
            return;
        }
        try {
            setisloading(true);
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/adminlogin`,
                formadata
            );

            if (res.data === "success") {
                toast.success("Logged in successfully!");
                router.push("/adminpanel");
            }
        } catch (err) {
            console.log(err)
            toast.error('Invalid user ( X )')
        }
    };

    return (

        <div className='min-h-screen bg-blue-900 via-gray-800 max-lg:pt-30 to-gray-900 flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                {/* Back Button */}
                <div className='mb-6'>
                    <button
                        onClick={() => route.push('/')}
                        className='group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40'
                    >
                        <BiLeftArrowAlt />
                        <span>Back to Home</span>

                    </button>
                </div>

                {/* Login Card */}
                <div className='bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20'>
                    <div className='text-center mb-8'>
                        <h1 className='text-3xl font-bold text-white mb-2'>Admin Login</h1>
                        <div className='w-20 h-1 bg-amber-500 mx-auto rounded-full'></div>
                    </div>

                    {/* Login Form */}
                    <div className='space-y-6'>
                        <div>
                            <label className='block text-white text-sm font-medium mb-2'>
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                value={formadata.username}
                                onChange={(e) => {
                                    handlechange(e)
                                    setError('')
                                }}
                                placeholder="Enter your username"
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                            />
                        </div>

                        <div>
                            <label className='block text-white text-sm font-medium mb-2'>
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formadata.password}
                                onChange={(e) => {
                                    handlechange(e)
                                    setError('')
                                }}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                            />
                        </div>

                        {error && (
                            <div className='bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
                                <p className='text-red-200 text-sm text-center'>{error}</p>
                            </div>
                        )}

                        <button
                            disabled={isloading}
                            onClick={handlesubmit}
                            className='w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg'
                        >
                            {isloading ? "Logging in..." : "Login"}
                        </button>
                    </div>

                    {/* Footer Note */}
                    <div className='mt-6 text-center'>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin