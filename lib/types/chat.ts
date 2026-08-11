export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
}

export interface PaginatedChatSessionList {
  items: ChatSession[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ChatSource {
  document_id: string;
  chunk_id: string;
  filename: string;
  snippet: string;
  page_number: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: ChatSource[] | null;
  created_at: string;
  error?: boolean;
}
