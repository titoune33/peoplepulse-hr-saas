"use client";

import { useState, useEffect, useCallback } from "react";
import { HRISStatus } from "@/components/dashboard/hris-status";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TurnoverChart } from "@/components/dashboard/turnover-chart";
import { DepartmentTable } from "@/components/dashboard/department-table";
import { AtRiskList } from "@/components/dashboard/at-risk-list";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { useAuth } from "@/lib/auth-context";
import { apiGetEmployees, apiGetInsights, Employee as ApiEmployee, Insight as ApiInsight } from "@/lib/api";
import {
  getKeyMetrics,
  getEmployees,
  getMonthlyTurnover,
  getDepartmentStats,
  getAtRiskEmployees,
  getAIInsights,
  getHRISConnections,
  Employee,
} from "@/lib/demo-data";
import { RefreshCw, Loader2, Crown, AlertCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DateRange = "12m" | "6m" | "3m" | "quarter";

function filterByDateRange<T extends { hireDate: string }>(employees: T[], range: DateRange): T[] {
  const now = new Date();
  let cutoff = new Date();
  switch (range) {
    case "6m":
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case "3m":
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case "quarter":
      cutoff.setMonth(now.getMonth() - 3);
      cutoff.setDate(1);
      break;
    default:
      cutoff = new Date(0);
  }
  if (range === "12m") return employees;
  return employees.filter((e) => new Date(e.hireDate) >= cutoff);
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const isPro = user?.plan === "pro";

  const [dateRange, setDateRange] = useState<DateRange>("12m");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [apiInsights, setApiInsights] = useState<ApiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!token) {
      setEmployees(getEmployees());
      return;
    }

    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [empRes, insightRes] = await Promise.all([
        apiGetEmployees({ limit: 200 }),
        apiGetInsights(),
      ]);

      if (empRes.success) {
        setEmployees(empRes.data.employees as unknown as Employee[]);
      } else {
        setEmployees(getEmployees());
        if (!showRefresh) setError("Could not load employee data. Showing demo data.");
      }

      if (insightRes.success) {
        setApiInsights(insightRes.data.insights);
      }
    } catch {
      setEmployees(getEmployees());
      setError("Backend unavailable. Showing demo data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token) {
      setEmployees(getEmployees());
      setApiInsights([]);
      setError(null);
    }
  }, [token]);

  const filteredEmployees = filterByDateRange(employees.length > 0 ? employees : getEmployees(), dateRange);

  const active = filteredEmployees.filter((e) => e.status === "active").length;
  const terminated = filteredEmployees.filter((e) => e.status === "terminated").length;
  const onLeave = filteredEmployees.filter((e) => e.status === "on_leave").length;
  const total = filteredEmployees.length || 1;
  const atRisk = filteredEmployees.filter((e) => e.attritionRisk && e.attritionRisk.score > 45).length;
  const turnoverRate = Math.round((terminated / total) * 1000) / 10;
  const avgTenureMonths = active > 0
    ? Math.round(
        filteredEmployees
          .filter((e) => e.status === "active")
          .reduce((sum, e) => sum + (Date.now() - new Date(e.hireDate).getTime()) / (30 * 24 * 60 * 60 * 1000), 0) / active
      )
    : 0;

  const filteredMetrics = {
    totalEmployees: total,
    activeEmployees: active,
    turnoverRate,
    avgTenureMonths,
    atRiskCount: atRisk,
    onLeave,
    openPositions: 8,
    timeToHire: 32,
    eNPS: 42,
  };

  const demoMetrics = getKeyMetrics();
  const metrics = employees.length > 0 ? filteredMetrics : demoMetrics;

  return (
    <div className="min-h-full">
      <HRISStatus />

      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">People Dashboard</h1>
              {isPro ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Crown className="w-3 h-3" />
                  AI POWERED
                </span>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <Crown className="w-3 h-3" />
                  Upgrade for AI insights
                </Link>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {metrics.activeEmployees} active employees · {metrics.openPositions} open positions · Last updated today
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 pr-7 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                aria-label="Filter by date range"
              >
                <option value="12m">Last 12 months</option>
                <option value="6m">Last 6 months</option>
                <option value="3m">Last 3 months</option>
                <option value="quarter">This quarter</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              Refresh
            </button>
            <Link
              href="/reports"
              className="text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Generate Report
            </Link>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button
              onClick={() => fetchData(true)}
              className="ml-auto text-xs font-medium underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3" />
                  <div className="h-7 w-16 bg-zinc-100 dark:bg-zinc-800 rounded mb-1" />
                  <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 animate-pulse">
                <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded mb-4" />
                <div className="h-[220px] bg-zinc-50 dark:bg-zinc-800 rounded" />
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 animate-pulse">
                <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <StatCards metrics={metrics} />

            {/* Charts + Table row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TurnoverChart />
              </div>
              <div>
                <DepartmentTable />
              </div>
            </div>

            {/* At-risk + AI Insights row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AtRiskList />
              <AIInsights apiInsights={apiInsights} isPro={isPro} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
