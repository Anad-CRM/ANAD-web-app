"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="57171100576-aairehmtvgctcitatuqv47j58srjodtm.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}
