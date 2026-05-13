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
const SAVED_ACCOUNTS_KEY = "anad_saved_accounts";

export function setRememberMe(value: boolean): void {
  localStorage.setItem(REMEMBER_ME_KEY, String(value));
}

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REMEMBER_ME_KEY) === "true";
}

export interface SavedAccount {
  email: string;
  password: string;
}

export function saveCredentials(email: string, password: string): void {
  if (typeof window === "undefined") return;
  const accounts = getSavedAccounts();
  const filtered = accounts.filter(acc => acc.email !== email);
  const newAccounts = [{ email, password }, ...filtered].slice(0, 5);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(newAccounts));
}

export function getSavedAccounts(): SavedAccount[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCredentials(): SavedAccount | null {
  const accounts = getSavedAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export function clearCredentials(): void {
  localStorage.removeItem(SAVED_ACCOUNTS_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

export function removeAccount(email: string): void {
  if (typeof window === "undefined") return;
  const accounts = getSavedAccounts();
  const filtered = accounts.filter(acc => acc.email !== email);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered));
}
