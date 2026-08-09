"use client";

import { getMonthlyTurnover } from "@/lib/demo-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function TurnoverChart() {
  const data = getMonthlyTurnover();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Turnover mensuel</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Volontaire
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> Involontaire
          </span>
        </div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "oklch(1 0 0)",
                border: "1px solid oklch(0.922 0 0)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line type="monotone" dataKey="voluntary" stroke="oklch(0.577 0.245 27.325)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="involuntary" stroke="oklch(0.556 0 0)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
