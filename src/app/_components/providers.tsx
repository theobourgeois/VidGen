"use client";
import { SessionProvider as NSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NSessionProvider>{children}</NSessionProvider>;
}
