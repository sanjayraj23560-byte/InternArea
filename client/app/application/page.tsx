'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Calendar, User, Loader2, Building2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

interface DBApplication {
    _id: string;
    company: string;
    category: string;
    status: string;
    createdAt?: string;
    user: {
        uid: string;
        email: string;
    };
    Application: {
        internshipId: string;
        title: string;
        location: string;
        stipend?: string;
        duration?: string;
    };
}

function Applications() {
    const route = useRouter()
    const [applications, setApplications] = useState<DBApplication[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch entries on initial screen load mount
    useEffect(() => {
        fetchAdminApplications()
    }, [])

    const fetchAdminApplications = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/job-applications/admin`)
            if (Array.isArray(res.data)) {
                setApplications(res.data)
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to load platform applications.")
        } finally {
            setLoading(false)
        }
    }

    // Process review button selections
    const handleStatusUpdate = async (id: string, nextStatus: 'Accepted' | 'Rejected') => {
        try {
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${id}/status`,
                { status: nextStatus }
            )

            if (res.status === 200) {
                toast.success(`Application marked as ${nextStatus}!`)

                // Update local UI state array directly without triggering another full reload
                setApplications(prev =>
                    prev.map(app => app._id === id ? { ...app, status: nextStatus } : app)
                )
            }
        } catch (err) {
            console.error("Status modification error:", err)
            toast.error("Failed to submit review state action.")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
        )
    }

    return (
        <div className='max-w-4xl mx-auto mt-40 p-10 min-h-screen'>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Incoming Applications</h1>
                <button
                    className='border border-gray-300 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium shadow-sm'
                    onClick={() => route.push('/adminpanel')}
                >
                    ← Back to Panel
                </button>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl text-gray-400">
                    <Briefcase className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="font-medium">No application records found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {applications.map((item) => (
                        <div key={item._id} className='bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md'>
                            <div className='flex flex-col gap-2.5 text-sm text-gray-600 w-full'>

                                <div className='flex items-center gap-2.5'>
                                    <Briefcase size={16} className="text-blue-500 shrink-0" />
                                    <h2 className='font-bold text-gray-900 text-base'>
                                        Role: {item.Application?.title || "Not Specified"}
                                    </h2>
                                    <span className={`ml-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${item.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>

                                <div className='flex items-center gap-2.5'>
                                    <Building2 size={16} className="text-gray-400 shrink-0" />
                                    <span>Company: <span className="font-medium text-gray-800">{item.company}</span></span>
                                </div>

                                <div className='flex items-center gap-2.5'>
                                    <User size={16} className="text-gray-400 shrink-0" />
                                    <span>Applicant Email: <span className="text-gray-800 font-medium">{item.user?.email}</span></span>
                                </div>

                                {item.createdAt && (
                                    <div className='flex items-center gap-2.5'>
                                        <Calendar size={16} className="text-gray-400 shrink-0" />
                                        <span>Submitted: <span className="text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                )}
                            </div>

                            {/* Review Controls Panel */}
                            <div className='flex flex-row gap-2 w-full md:w-auto shrink-0 md:justify-end border-t md:border-t-0 pt-3 md:pt-0'>
                                {item.status === "Pending" ? (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'Accepted')}
                                            className='flex-1 md:flex-none font-semibold px-4 py-2 text-white bg-green-500 rounded-xl hover:bg-green-600 transition text-sm shadow-sm'
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                                            className='flex-1 md:flex-none font-semibold px-4 py-2 text-white bg-red-500 rounded-xl hover:bg-red-600 transition text-sm shadow-sm'
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400 italic font-medium p-2">
                                        Reviewed Action Locked
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Applications
