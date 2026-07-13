'use client'

import { useConnection, ConnectionStatus } from './useConnection';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';

interface ConnectionButtonProps {
  currentUserId: string | undefined;
  targetUserId: string;
}

export default function ConnectionButton({ currentUserId, targetUserId }: ConnectionButtonProps) {
  const { status, loading, handleConnectionAction } = useConnection(currentUserId, targetUserId);

  // Safeguard: Hide the action button on your own user cards
  if (!currentUserId || currentUserId === targetUserId) return null;

  // Tailored configurations using explicit Tailwind utility classes
  const config: Record<ConnectionStatus, { text: string; styles: string; icon: any }> = {
    none: { 
      text: 'Connect', 
      styles: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent', 
      icon: <UserPlus size={14} /> 
    },
    pending_sent: { 
      text: 'Pending', 
      styles: 'bg-gray-100 hover:bg-red-50 hover:text-red-600 border-gray-300 text-gray-600 hover:border-red-200', 
      icon: <UserX size={14} className="hidden group-hover:inline transition-colors" /> 
    },
    pending_received: { 
      text: 'Accept', 
      styles: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent animate-pulse hover:animate-none', 
      icon: <UserCheck size={14} /> 
    },
    connected: { 
      text: 'Connected', 
      styles: 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50/50', 
      icon: <UserCheck size={14} /> 
    }
  };

  const currentConfig = config[status];

  return (
    <button
      onClick={handleConnectionAction}
      disabled={loading}
      className={`group flex items-center justify-center gap-1.5 font-bold px-3 py-1.5 text-xs border rounded-2xl transition-all duration-200 min-w-23.75 select-none disabled:opacity-60 disabled:pointer-events-none ${currentConfig.styles}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          {currentConfig.icon}
          {/* Handles displaying alternative text labels on mouse-hover patterns natively */}
          <span className={status === 'pending_sent' ? 'group-hover:hidden' : ''}>
            {currentConfig.text}
          </span>
          {status === 'pending_sent' && (
            <span className="hidden group-hover:inline font-semibold">Withdraw</span>
          )}
        </>
      )}
    </button>
  );
}
