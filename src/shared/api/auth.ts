import { http } from './http';

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
