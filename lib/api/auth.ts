import { apiFetch, setAccessToken } from './client';
import { User } from '../types/user';

export interface RegisterPayload {
  email: string;
  password?: string;
  full_name: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const tokens = await apiFetch<AuthTokens>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAccessToken(tokens.access_token);
  return tokens;
}

export async function refresh(refresh_token: string): Promise<RefreshResponse> {
  const data = await apiFetch<RefreshResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
  });
  setAccessToken(data.access_token);
  return data;
}

export async function logout(refresh_token: string): Promise<void> {
  try {
    await apiFetch<void>('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
  } finally {
    setAccessToken(null);
  }
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/v1/auth/me', {
    method: 'GET',
  });
}
