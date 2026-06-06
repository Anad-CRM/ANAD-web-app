import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createClient = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock: any = new Proxy(function() {}, {
    get(target, prop) {
      if (prop === 'then') return undefined; 
      if (prop === 'auth') return { getSession: async () => ({ data: { session: null } }) };
      if (prop === 'getUser') return async () => ({ data: { user: null } });
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
