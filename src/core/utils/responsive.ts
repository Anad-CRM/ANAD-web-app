export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
} as const;

export function authPanelClasses(override?: string): string {
  if (override) return override;
  return "w-full max-w-[560px] h-auto min-h-[300px] sm:min-h-[355px]";
}

export function authInputClasses(): string {
  return "w-full max-w-[350px]";
}

export function authButtonClasses(): string {
  return "w-full max-w-[200px] h-[50px]";
}

export function authSignupPanelClasses(): string {
  return "w-full max-w-[900px] min-h-[480px] flex flex-col justify-center py-6";
}
