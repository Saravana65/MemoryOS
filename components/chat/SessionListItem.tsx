import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSession } from '@/lib/types/chat';

interface SessionListItemProps {
  session: ChatSession;
  isActive: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const SessionListItem: React.FC<SessionListItemProps> = ({ session, isActive, onDelete }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const title = session.title || 'New conversation';
  const createdDate = new Date(session.created_at).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this conversation?')) {
      setIsDeleting(true);
      try {
        await onDelete(session.id);
      } catch (err) {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={() => router.push(`/chat/${session.id}`)}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-[#E8ECE9] text-[#1C222E]'
          : 'text-gray-700 hover:bg-[#FAF9F6] hover:text-[#1C222E]'
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-sm font-semibold truncate font-sans">{title}</p>
        <p className="text-[10px] text-gray-400 font-sans mt-0.5">{createdDate}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`p-1 text-gray-400 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100 ${
          isDeleting ? 'cursor-not-allowed' : ''
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
export default SessionListItem;
