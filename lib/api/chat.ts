import { apiFetch } from './client';
import { ChatSession, PaginatedChatSessionList, ChatMessage } from '../types/chat';

export async function createSession(): Promise<ChatSession> {
  return apiFetch<ChatSession>('/api/v1/chat/sessions', {
    method: 'POST',
  });
}

export async function getSessions(page: number = 1, pageSize: number = 20): Promise<PaginatedChatSessionList> {
  return apiFetch<PaginatedChatSessionList>(`/api/v1/chat/sessions?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
}

export async function getSession(id: string): Promise<ChatSession> {
  return apiFetch<ChatSession>(`/api/v1/chat/sessions/${id}`, {
    method: 'GET',
  });
}

export async function deleteSession(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/chat/sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  return apiFetch<ChatMessage[]>(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'GET',
  });
}
