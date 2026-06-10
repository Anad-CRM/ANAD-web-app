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
