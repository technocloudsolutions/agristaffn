"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <NextUIProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
