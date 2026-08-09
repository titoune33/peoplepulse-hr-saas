import { getHRISConnections } from "@/lib/demo-data";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export function HRISStatus() {
  const connections = getHRISConnections();

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-2">SIRH connectés :</span>
      {connections.map((c) => (
        <div
          key={c.provider}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800"
        >
          {c.status === "connected" ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-600" />
          )}
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{c.provider}</span>
          <span className="text-[10px] text-emerald-500 dark:text-emerald-400">· synchro {c.lastSync}</span>
        </div>
      ))}
      <button className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
        <RefreshCw className="w-3 h-3" />
        Tout synchroniser
      </button>
    </div>
  );
}
