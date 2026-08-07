const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onTokenRefreshCallback: ((token: string | null) => void) | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (onTokenRefreshCallback) {
    onTokenRefreshCallback(token);
  }
};

export const getAccessToken = () => accessToken;

export const setOnTokenRefresh = (callback: (token: string | null) => void) => {
  onTokenRefreshCallback = callback;
};

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = { ...options.headers };

  // Set Authorization header if access token exists
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Set default Content-Type to application/json if body is present and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    // Attempt silent token refresh
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh();
    }

    const newAccessToken = await refreshPromise;
    refreshPromise = null;

    if (newAccessToken) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, fetchOptions);
    } else {
      // Refresh failed, trigger logout/clean up
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new Event('auth-logout'));
      }
      throw new Error('Unauthorized');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'API request failed' }));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Refresh failed');
    }

    const data = await res.json();
    const newAccessToken = data.access_token;
    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (err) {
    console.error('Failed to refresh token silently:', err);
    return null;
  }
}
