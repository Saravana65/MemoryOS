export interface Document {
  id: string;
  filename: string;
  file_type: 'pdf' | 'image' | 'txt' | 'docx' | 'other';
  status: 'pending' | 'processing' | 'ready' | 'failed';
  file_size_bytes: number;
  created_at: string;
  processing_error?: string | null;
}

export interface PaginatedDocumentList {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
