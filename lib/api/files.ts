import { apiFetch, getAccessToken } from './client';
import { Document, PaginatedDocumentList } from '../types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getFiles(page: number = 1, pageSize: number = 50): Promise<PaginatedDocumentList> {
  return apiFetch<PaginatedDocumentList>(`/api/v1/files?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
  });
}

export async function getFile(id: string): Promise<Document> {
  return apiFetch<Document>(`/api/v1/files/${id}`, {
    method: 'GET',
  });
}

export async function deleteFile(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/files/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Document> {
  const executeUpload = (): Promise<Document> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', `${API_URL}/api/v1/files/upload`);

      const token = getAccessToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          if (xhr.status === 401) {
            const err = new Error('Unauthorized');
            (err as any).status = 401;
            reject(err);
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.detail || errorData.message || 'Upload failed'));
            } catch (e) {
              reject(new Error('Upload failed'));
            }
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.send(formData);
    });
  };

  try {
    return await executeUpload();
  } catch (err: any) {
    if (err.status === 401) {
      // Access token expired, attempt exactly one silent token refresh.
      // Reuses the apiFetch automatic refresh by calling a lightweight authenticated endpoint.
      try {
        await apiFetch('/api/v1/auth/me', { method: 'GET' });
      } catch (refreshErr) {
        // If the refresh failed, apiFetch has already cleared tokens and triggered logout.
        // We propagate the original Unauthorized error.
        throw err;
      }

      // Retry the upload exactly once with the refreshed token.
      return await executeUpload();
    }
    throw err;
  }
}
