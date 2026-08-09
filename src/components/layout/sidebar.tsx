"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/providers";
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Zap,
  ChevronRight,
  TrendingUp,
  Crown,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/insights", label: "AI Insights", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, resolved } = useTheme();

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  const isPro = user?.plan === "pro";

  return (
    <aside className="w-60 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">PeoplePulse</span>
            <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider leading-none">HR Analytics</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-violet-600 dark:text-violet-400" : "")} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        {/* Plan badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
          isPro
            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
        )}>
          <Crown className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</span>
          {!isPro && (
            <Link
              href="/pricing"
              className="ml-auto text-violet-600 dark:text-violet-400 hover:underline text-[11px] font-medium"
            >
              Upgrade
            </Link>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle color theme"
        >
          {resolved === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          <span>{theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"} mode</span>
        </button>

        {/* User info */}
        {user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3">
            <Link
              href="/login"
              className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
