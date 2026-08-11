'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSessions, deleteSession, getMessages, sendMessage } from '@/lib/api/chat';
import { getFiles } from '@/lib/api/files';
import { ChatSession, ChatMessage } from '@/lib/types/chat';
import { SessionList } from '@/components/chat/SessionList';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(true);
  const [failedContentMap, setFailedContentMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsData, messagesData, filesData] = await Promise.all([
        getSessions(1, 100),
        getMessages(sessionId),
        getFiles(1, 1).catch(() => ({ total: 0 })),
      ]);
      setSessions(sessionsData.items);
      setMessages(messagesData);
      setHasDocuments(filesData.total > 0);
    } catch (err) {
      console.error('Failed to load chat session data:', err);
      // Redirect to main chat page if session is invalid or not owned
      router.push('/chat');
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId, fetchData]);

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === sessionId) {
        router.push('/chat');
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);

    const tempUserMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content,
      sources: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await sendMessage(sessionId, content);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      const errId = Math.random().toString(36).substring(2, 11);
      const errMsg: ChatMessage = {
        id: errId,
        role: 'assistant',
        content: 'An error occurred while communicating with the assistant.',
        sources: null,
        created_at: new Date().toISOString(),
        error: true,
      };
      setFailedContentMap((prev) => ({ ...prev, [errId]: content }));
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleRetryMessage = async (errId: string) => {
    const content = failedContentMap[errId];
    if (!content) return;

    // Remove the error message from messages list
    setMessages((prev) => prev.filter((m) => m.id !== errId));
    // Clear from map
    setFailedContentMap((prev) => {
      const copy = { ...prev };
      delete copy[errId];
      return copy;
    });

    await handleSendMessage(content);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-[#FAF9F6] border border-[#E8ECE9] rounded-xl shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#4F6D60]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gray-500 font-sans font-medium">Loading session conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex border border-[#E8ECE9] rounded-xl overflow-hidden bg-white shadow-sm">
      <SessionList
        sessions={sessions}
        activeSessionId={sessionId}
        onDeleteSession={handleDeleteSession}
      />
      <ChatWindow
        messages={messages}
        loading={sending}
        hasDocuments={hasDocuments}
        onSendMessage={handleSendMessage}
        onRetryMessage={handleRetryMessage}
      />
    </div>
  );
}
