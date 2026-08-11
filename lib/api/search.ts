import { apiFetch } from './client';
import { PaginatedSearchResult } from '../types/search';

export async function searchDocuments(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedSearchResult> {
  return apiFetch<PaginatedSearchResult>(
    `/api/v1/search?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`,
    { method: 'GET' }
  );
}
