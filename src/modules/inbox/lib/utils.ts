import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createClient = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock: any = new Proxy(function() {}, {
    get(target, prop) {
      if (prop === 'then') return undefined; // prevent await from hanging
      if (prop === 'auth') return { getSession: async () => ({ data: { session: null } }) };
      if (prop === 'getUser') return async () => ({ data: { user: null } });
      if (prop === Symbol.toPrimitive || prop === 'toString') return () => '[Mock Supabase Proxy]';
      return mock;
    },
    apply() {
      return mock;
    }
  });
  return mock;
};
