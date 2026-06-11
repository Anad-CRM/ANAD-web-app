import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createClient = () => {
  const auth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock: any = new Proxy(function() {}, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'auth') return auth;
      if (prop === Symbol.toPrimitive || prop === 'toString') return () => '[Mock Supabase Proxy]';
      if (typeof prop === 'string' && ['message', 'details', 'hint', 'code'].includes(prop)) return 'Mock error property';
      return mock;
    },
    apply() {
      return mock;
    }
  });
  return mock;
};

export function parseSafeDate(dateInput: Date | string | number | null | undefined): Date {
  if (!dateInput) return new Date(NaN);
  if (dateInput instanceof Date) return dateInput;
  const str = String(dateInput).trim();
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    // If it's in seconds (under 10 billion), convert to milliseconds
    const ms = num < 10000000000 ? num * 1000 : num;
    return new Date(ms);
  }
  return new Date(str);
}

