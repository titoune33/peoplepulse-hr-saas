"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { AuthLoading } from "./auth-loading";

const publicPaths = ["/", "/login", "/register", "/pricing"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();
  const isPublic = publicPaths.includes(pathname);
  const [mounted, setMounted] = useState(false);

  // Évite le mismatch d'hydration SSR/client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR ou avant l'hydration, rend le contenu sans condition
  if (!mounted) {
    return <main className="flex-1">{children}</main>;
  }

  // Une fois hydraté côté client, affiche le loader si l'auth est en cours
  if (isLoading && !isPublic) {
    return <AuthLoading />;
  }

  if (isPublic) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {/* Mobile hamburger menu */}
      <MobileNav />

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 min-h-screen">
        <div className="lg:hidden h-14" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </>
  );
}
