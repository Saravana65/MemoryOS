export interface SearchMatch {
  chunk_text: string;
  page_number: number | null;
  score: number;
}

export interface SearchResultItem {
  document_id: string;
  filename: string;
  file_type: 'pdf' | 'image' | 'txt' | 'docx' | 'other';
  created_at: string;
  matches: SearchMatch[];
}

export interface PaginatedSearchResult {
  items: SearchResultItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
