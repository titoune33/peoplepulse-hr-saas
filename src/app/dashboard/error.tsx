"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {error.message || "Impossible de charger le tableau de bord."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
