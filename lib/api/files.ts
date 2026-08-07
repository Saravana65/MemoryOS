import { getAccessToken } from './client';
import { Document, PaginatedDocumentList } from '../types/document';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getFiles(page: number = 1, pageSize: number = 50): Promise<PaginatedDocumentList> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/v1/files?page=${page}&page_size=${pageSize}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch files' }));
    throw new Error(errorData.detail || 'Failed to fetch files');
  }

  // Handle case where backend might return items directly as an array instead of paginated object
  const data = await res.json();
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      page_size: data.length,
      pages: 1,
    };
  }

  return data;
}

export async function getFile(id: string): Promise<Document> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/v1/files/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch file details' }));
    throw new Error(errorData.detail || 'Failed to fetch file details');
  }

  return res.json();
}

export async function deleteFile(id: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/v1/files/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to delete file' }));
    throw new Error(errorData.detail || 'Failed to delete file');
  }
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Document> {
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
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.detail || errorData.message || 'Upload failed'));
        } catch (e) {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.send(formData);
  });
}
