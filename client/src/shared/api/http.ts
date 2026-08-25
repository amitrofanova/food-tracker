import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearClientSession,
  getNativeAccessToken,
  getNativeRefreshToken,
  isNativePlatform,
  setNativeTokens,
} from '@/shared/lib/auth';

interface RetryConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean;
}

export const http = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? '') + '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

function isAuthSkipUrl(url = ''): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

http.interceptors.request.use(async (config) => {
  if (isNativePlatform()) {
    const token = await getNativeAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const nativeRefresh = isNativePlatform() ? await getNativeRefreshToken() : null;
      const { data } = await http.post<{ token: string; refreshToken: string }>(
        '/auth/refresh',
        nativeRefresh ? { refreshToken: nativeRefresh } : {},
      );
      if (isNativePlatform() && data.token && data.refreshToken) {
        await setNativeTokens(data.token, data.refreshToken);
      }
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? '';

    if (status !== 401 || !config || config._authRetry || isAuthSkipUrl(url)) {
      return Promise.reject(error);
    }

    config._authRetry = true;
    const refreshed = await refreshSession();
    if (!refreshed) {
      clearClientSession();
      return Promise.reject(error);
    }
    return http.request(config);
  },
);

export const openfoodfactsHttp = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
  headers: { 'Content-Type': 'application/json' },
});
