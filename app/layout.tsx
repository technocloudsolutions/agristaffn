import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/app/globals.css";
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body>
        <AuthProvider>
          <Providers>{children}</Providers>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
