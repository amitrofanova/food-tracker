import { http } from './http';
import { getNativeRefreshToken, isNativePlatform } from '@/shared/lib/auth';

export async function registerUser(payload: { email: string; password: string }) {
  return http.post('/auth/register', payload);
}

export async function loginUser(payload: { email: string; password: string }) {
  return http.post('/auth/login', payload);
}

export async function getCurrentUser() {
  return http.get('/auth/me');
}

export async function updateCurrentUser(payload: { calorieBudget?: number }) {
  return http.patch('/auth/me', payload);
}

export async function logoutUser() {
  const refreshToken = isNativePlatform() ? await getNativeRefreshToken() : null;
  return http.post('/auth/logout', refreshToken ? { refreshToken } : {});
}
