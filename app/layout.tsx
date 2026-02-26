import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { QueryProvider } from "@/context/QueryProvider";

export const metadata: Metadata = {
  title: "Internal App",
  description: "Multi-department financial routing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
              <ToastViewport />
            </AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
