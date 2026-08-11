import React from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { SourceCitation } from './SourceCitation';

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div
        className={`px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#1C222E] rounded-2xl rounded-tr-none max-w-[80%]'
            : 'bg-[#E8ECE9]/50 border border-[#E8ECE9] text-[#1C222E] rounded-2xl rounded-tl-none max-w-[80%]'
        }`}
      >
        <div className="whitespace-pre-wrap font-sans text-[#1C222E]">{message.content}</div>

        {message.error && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-semibold font-sans">
            <span>Failed to send message.</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="underline hover:text-red-800 font-bold focus:outline-none"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} />
        )}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1 font-sans">
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};
export default MessageBubble;
