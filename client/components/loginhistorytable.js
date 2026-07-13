'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Monitor, Smartphone, Tablet, Loader2, ShieldAlert, CheckCircle2, ShieldQuestion } from 'lucide-react';
const DEVICE_ICONS = {
    Mobile: Smartphone,
    Tablet: Tablet,
    Desktop: Monitor,
};

const STATUS_STYLES = {
    Success: 'bg-green-100 text-green-700 border-green-200',
    'OTP Verified': 'bg-green-100 text-green-700 border-green-200',
    'OTP Sent': 'bg-amber-100 text-amber-700 border-amber-200',
    'OTP Failed': 'bg-red-100 text-red-700 border-red-200',
    'Blocked - Outside Hours': 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = {
    Success: CheckCircle2,
    'OTP Verified': CheckCircle2,
    'OTP Sent': ShieldQuestion,
    'OTP Failed': ShieldAlert,
    'Blocked - Outside Hours': ShieldAlert,
};

export default function LoginHistoryTable({ uid }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/login/history`, { params: { uid } });
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load login history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [uid]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 className="animate-spin" size={20} />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
                No login activity recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((entry) => {
                const DeviceIcon = DEVICE_ICONS[entry.deviceType] || Monitor;
                const StatusIcon = STATUS_ICONS[entry.status] || CheckCircle2;
                const statusStyle = STATUS_STYLES[entry.status] || 'bg-gray-100 text-gray-700 border-gray-200';

                return (
                    <div
                        key={entry._id}
                        className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                                <DeviceIcon size={16} />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">
                                    {entry.browser} on {entry.os}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {entry.deviceType} · {entry.ip} ·{' '}
                                    {new Date(entry.createdAt).toLocaleString('en-IN', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`flex items-center gap-1 shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}
                        >
                            <StatusIcon size={13} />
                            {entry.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}