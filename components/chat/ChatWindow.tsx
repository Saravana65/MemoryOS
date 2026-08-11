import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib/types/chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import Link from 'next/link';

interface ChatWindowProps {
  messages: ChatMessage[];
  loading: boolean;
  hasDocuments: boolean;
  onSendMessage: (content: string) => void;
  onRetryMessage: (messageId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading,
  hasDocuments,
  onSendMessage,
  onRetryMessage,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F6]">
      {/* Messages view */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Empty documents guidance */}
        {!hasDocuments && (
          <div className="bg-white border border-[#E8ECE9] rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-[#C5A059] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-[#1C222E] font-sans">No documents uploaded yet</h4>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  You can still ask Claude general questions, but to get context-grounded RAG answers, please{' '}
                  <Link href="/upload" className="underline font-medium text-[#4F6D60] hover:text-[#1C222E]">
                    upload some documents
                  </Link>{' '}
                  first.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <h3 className="text-lg font-bold text-[#1C222E] font-serif mb-2">MemoryOS Vault Assistant</h3>
            <p className="text-sm text-gray-500 max-w-md font-sans">
              Ask any question about your library. MemoryOS will retrieve relevant fragments and compile answers grounded in your data.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRetry={() => onRetryMessage(msg.id)}
          />
        ))}

        {loading && (
          <div className="flex flex-col items-start mb-4">
            <div className="bg-[#E8ECE9]/50 border border-[#E8ECE9] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#4F6D60] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#4F6D60] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-[#4F6D60] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-gray-400 font-sans italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <ChatInput onSend={onSendMessage} disabled={loading} />
    </div>
  );
};
export default ChatWindow;
