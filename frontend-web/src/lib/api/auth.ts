import { apiClient } from './index';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const { data } = await apiClient.post<{ access_token: string }>('/api/v1/auth/refresh');
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/api/v1/auth/me');
  return data;
}
