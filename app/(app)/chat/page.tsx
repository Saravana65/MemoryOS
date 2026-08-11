'use client';

import React, { useState, useEffect } from 'react';
import { getSessions, deleteSession, createSession } from '@/lib/api/chat';
import { getFiles } from '@/lib/api/files';
import { ChatSession } from '@/lib/types/chat';
import { SessionList } from '@/components/chat/SessionList';

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(true);

  const fetchInitialData = async () => {
    try {
      const [sessionsData, filesData] = await Promise.all([
        getSessions(1, 100),
        getFiles(1, 1).catch(() => ({ total: 0 })),
      ]);
      setSessions(sessionsData.items);
      setHasDocuments(filesData.total > 0);
    } catch (err) {
      console.error('Failed to load chat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-[#FAF9F6] border border-[#E8ECE9] rounded-xl shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#4F6D60]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gray-500 font-sans font-medium">Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex border border-[#E8ECE9] rounded-xl overflow-hidden bg-white shadow-sm">
      <SessionList
        sessions={sessions}
        onDeleteSession={handleDeleteSession}
      />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#FAF9F6]">
        <div className="max-w-md">
          <svg className="mx-auto h-12 w-12 text-[#4F6D60] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-bold text-[#1C222E] font-serif mb-2">MemoryOS Vault Chat</h2>
          <p className="text-sm text-gray-500 font-sans mb-6 leading-relaxed">
            {!hasDocuments 
              ? "You haven't uploaded any documents to your memory vault yet. Upload files to query details." 
              : "Select a conversation from the sidebar or start a new thread to recall context references."
            }
          </p>
          {!hasDocuments ? (
            <a
              href="/upload"
              className="inline-block bg-[#4F6D60] hover:bg-[#4F6D60]/90 text-white font-medium py-2.5 px-6 rounded-md text-sm transition-colors font-sans"
            >
              Upload documents first
            </a>
          ) : (
            <button
              onClick={async () => {
                try {
                  const s = await createSession();
                  window.location.href = `/chat/${s.id}`;
                } catch (e) {
                  console.error(e);
                }
              }}
              className="inline-block bg-[#4F6D60] hover:bg-[#4F6D60]/90 text-white font-medium py-2.5 px-6 rounded-md text-sm transition-colors font-sans"
            >
              Start conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
