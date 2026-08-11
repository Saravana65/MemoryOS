import React from 'react';
import { useRouter } from 'next/navigation';
import { ChatSession } from '@/lib/types/chat';
import { createSession } from '@/lib/api/chat';
import { SessionListItem } from './SessionListItem';

interface SessionListProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onDeleteSession: (id: string) => Promise<void>;
  onCreateSession?: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  activeSessionId,
  onDeleteSession,
  onCreateSession,
}) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      if (onCreateSession) {
        onCreateSession();
      } else {
        const session = await createSession();
        router.push(`/chat/${session.id}`);
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-80 border-r border-[#E8ECE9] bg-white flex flex-col h-full">
      <div className="p-4 border-b border-[#E8ECE9]">
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="w-full bg-[#4F6D60] hover:bg-[#4F6D60]/90 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isCreating ? 'Creating...' : 'New Chat'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 font-sans">No conversations yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onDelete={onDeleteSession}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default SessionList;
