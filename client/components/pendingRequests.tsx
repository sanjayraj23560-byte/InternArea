'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserCheck, UserX, Loader2 } from "lucide-react";

interface PendingRequestsProps {
    currentUserId: string | undefined;
    onCountChange?: (count: number) => void;
}

interface RequestItem {
    _id: string;
    senderId: string;
    senderName?: string;
    senderPhoto?: string;
}

export default function PendingRequests({ currentUserId, onCountChange }: PendingRequestsProps) {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/engagerequest`;

    const fetchRequests = async () => {
        if (!currentUserId) return;
        try {
            const res = await axios.get(`${API_URL}/incoming`, { params: { userId: currentUserId } });
            setRequests(res.data);
            // Alert parent page about the count state right away
            if (onCountChange) onCountChange(res.data.length);
        } catch (err) {
            console.error("Failed to fetch pending requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUserId]);

    const handleAction = async (senderId: string, action: 'accept' | 'remove') => {
        setActionLoading(senderId);
        try {
            if (action === 'accept') {
                await axios.post(`${API_URL}/accept`, { senderId, receiverId: currentUserId });
                toast.success("Connection accepted!");
            } else {
                await axios.post(`${API_URL}/remove`, { userA: senderId, userB: currentUserId });
                toast.info("Invitation ignored.");
            }

            // Remove from state array and notify parent right after action executes
            setRequests((prev) => {
                const updated = prev.filter((req) => req.senderId !== senderId);
                if (onCountChange) onCountChange(updated.length);
                return updated;
            });
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    // Keep active monitoring layer alive without absolute hard returns
    if (!currentUserId) return null;
    if (requests.length === 0 && !loading) return null;

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>👋 Invitation Requests</span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {requests.length}
                </span>
            </h2>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requests.map((req, id) => (
                        <div key={id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                            <div key={id} className="flex items-center gap-3">
                                {req.senderPhoto ? (
                                    <img src={req.senderPhoto} alt={req.senderName} className="w-10 h-10 rounded-full object-cover border" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center uppercase text-sm">
                                        {req.senderName?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 capitalize">{req.senderName || "Community Member"}</h4>
                                    <p className="text-xs text-gray-500">Wants to connect with you</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={actionLoading !== null}
                                    onClick={() => handleAction(req.senderId, 'accept')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition shadow-sm disabled:opacity-50"
                                    title="Accept"
                                >
                                    {actionLoading === req.senderId ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                </button>
                                <button
                                    disabled={actionLoading !== null}
                                    onClick={() => handleAction(req.senderId, 'remove')}
                                    className="bg-white border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 p-2 rounded-xl transition disabled:opacity-50"
                                    title="Ignore"
                                >
                                    <UserX size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}