"use client";

import { TrendingUp, Loader2 } from "lucide-react";

export function AuthLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading PeoplePulse...
        </div>
      </div>
    </div>
  );
}
