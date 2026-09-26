import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const SESSION_HINT_KEY = "hasSession";
const NATIVE_ACCESS_KEY = "accessToken";
const NATIVE_REFRESH_KEY = "refreshToken";

let unauthorizedHandler: (() => void) | null = null;

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_HINT_KEY) === "1";
}

export function setSessionHint(value: boolean): void {
  if (value) {
    localStorage.setItem(SESSION_HINT_KEY, "1");
  } else {
    localStorage.removeItem(SESSION_HINT_KEY);
  }
  localStorage.removeItem("token");
}

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function clearClientSession(): void {
  setSessionHint(false);
  void clearNativeTokens();
  unauthorizedHandler?.();
}

export async function getNativeAccessToken(): Promise<string | null> {
  if (!isNativePlatform()) return null;
  const { value } = await Preferences.get({ key: NATIVE_ACCESS_KEY });
  return value;
}

export async function getNativeRefreshToken(): Promise<string | null> {
  if (!isNativePlatform()) return null;
  const { value } = await Preferences.get({ key: NATIVE_REFRESH_KEY });
  return value;
}

export async function setNativeTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (!isNativePlatform()) return;
  await Preferences.set({ key: NATIVE_ACCESS_KEY, value: accessToken });
  await Preferences.set({ key: NATIVE_REFRESH_KEY, value: refreshToken });
}

export async function clearNativeTokens(): Promise<void> {
  if (!isNativePlatform()) return;
  await Preferences.remove({ key: NATIVE_ACCESS_KEY });
  await Preferences.remove({ key: NATIVE_REFRESH_KEY });
}
