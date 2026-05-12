const TOKEN_KEY = "anad_token";
const USER_KEY = "anad_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

const REMEMBER_ME_KEY = "anad_remember_me";
const SAVED_CREDENTIALS_KEY = "anad_credentials";

export function setRememberMe(value: boolean): void {
  localStorage.setItem(REMEMBER_ME_KEY, String(value));
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export function saveCredentials(email: string, password: string): void {
  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify({ email, password }));
}

export function getCredentials(): { email: string; password: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  localStorage.removeItem(SAVED_CREDENTIALS_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}
