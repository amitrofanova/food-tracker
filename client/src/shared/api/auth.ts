import { http } from './http';
import { getNativeRefreshToken, isNativePlatform } from '@/shared/lib/auth';

export type AuthUser = {
  id: number;
  email: string;
  calorieBudget?: number | null;
};

export type AuthSessionResponse = {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
};

export async function registerUser(payload: { email: string; password: string }) {
  return http.post('/auth/register', payload);
}

export async function loginUser(payload: { email: string; password: string }) {
  const body = isNativePlatform() ? { ...payload, client: 'capacitor' as const } : payload;
  return http.post<AuthSessionResponse>('/auth/login', body);
}

export async function getCurrentUser() {
  return http.get<AuthUser>('/auth/me');
}

export async function updateCurrentUser(payload: { calorieBudget: number | null }) {
  return http.patch<AuthUser>('/auth/me', payload);
}

export async function logoutUser() {
  const refreshToken = isNativePlatform() ? await getNativeRefreshToken() : null;
  return http.post('/auth/logout', refreshToken ? { refreshToken } : {});
}
