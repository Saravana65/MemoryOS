export interface Document {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size_bytes: number;
  created_at: string;
}

export interface PaginatedDocumentList {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
