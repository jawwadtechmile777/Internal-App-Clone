"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute executiveOnly>{children}</ProtectedRoute>;
}
