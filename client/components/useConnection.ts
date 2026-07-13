import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export function useConnection(currentUserId: string | undefined, targetUserId: string) {
    const [status, setStatus] = useState<ConnectionStatus>('none');
    const [loading, setLoading] = useState(false);
    // Tracks whether we've actually received a real answer from GET /status yet.
    // Without this, `status` sits at its default 'none' for a moment after mount,
    // and a click during that window sends the WRONG action to the backend
    // (e.g. POST /request when the real status is 'pending_received'), which
    // the backend correctly rejects with a 400 — that's the error you were seeing.
    const [statusLoaded, setStatusLoaded] = useState(false);

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/engagerequest`; // Matches your setup path

    useEffect(() => {
        if (!currentUserId || !targetUserId) {
            // No valid pair to check — nothing to load, but also nothing stale
            // to act on, so don't leave the button in a perpetual "loading" state.
            setStatusLoaded(false);
            return;
        }

        setStatusLoaded(false);

        axios.get(`${API_URL}/status`, { params: { senderId: currentUserId, receiverId: targetUserId } })
            .then(res => {
                if (res.data.status === 'none') setStatus('none');
                else if (res.data.status === 'accepted') setStatus('connected');
                else if (res.data.status === 'pending') {
                    setStatus(res.data.isSender ? 'pending_sent' : 'pending_received');
                }
            })
            .catch(err => console.error("Error fetching connection status", err))
            .finally(() => setStatusLoaded(true));
    }, [currentUserId, targetUserId, API_URL]);

    const handleConnectionAction = async () => {
        if (!currentUserId) {
            toast.error("Please login to manage connections!");
            return;
        }

        if (!targetUserId) {
            toast.error("Unable to identify this user.");
            return;
        }

        if (!statusLoaded) {
            // Guard against acting on the stale default 'none' state before
            // we actually know the real connection status.
            toast.info("Still checking connection status, try again in a moment.");
            return;
        }

        setLoading(true);

        try {
            if (status === 'none' || status === 'pending_sent') {
                const res = await axios.post(`${API_URL}/request`, { senderId: currentUserId, receiverId: targetUserId });
                setStatus(res.data.status === 'pending' ? 'pending_sent' : 'none');
                toast.success(res.data.message);
            } else if (status === 'pending_received') {
                await axios.post(`${API_URL}/accept`, { senderId: targetUserId, receiverId: currentUserId });
                setStatus('connected');
                toast.success("Connection accepted!");
            } else if (status === 'connected') {
                if (confirm("Are you sure you want to remove this connection?")) {
                    await axios.post(`${API_URL}/remove`, { userA: currentUserId, userB: targetUserId });
                    setStatus('none');
                    toast.info("Connection removed.");
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Action failed");
            console.error("Connection action failed:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return { status, loading, handleConnectionAction };
}