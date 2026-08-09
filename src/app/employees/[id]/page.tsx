"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getEmployees, Employee } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { apiGetEmployee } from "@/lib/api";
import { HRISStatus } from "@/components/dashboard/hris-status";
import { ArrowLeft, Mail, Building2, Briefcase, Calendar, DollarSign, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();

  const allEmployees = getEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      setError(null);
      apiGetEmployee(id)
        .then((res) => {
          if (res.success) {
            setEmployee(res.data.employee as unknown as Employee);
          } else {
            // Fallback to demo
            const demo = allEmployees.find((e) => e.id === id) || null;
            setEmployee(demo);
            if (!demo) setError("Employee not found.");
          }
        })
        .catch(() => {
          const demo = allEmployees.find((e) => e.id === id) || null;
          setEmployee(demo);
          if (!demo) setError("Employee not found.");
        })
        .finally(() => setIsLoading(false));
    } else {
      const demo = allEmployees.find((e) => e.id === id) || null;
      setEmployee(demo);
      if (!demo) setError("Employee not found.");
    }
  }, [id, token, allEmployees]);

  if (isLoading) {
    return (
      <div className="min-h-full">
        <HRISStatus />
        <div className="p-6 max-w-[1000px] mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-7 w-48 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-full">
        <HRISStatus />
        <div className="p-6 max-w-[1000px] mx-auto text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Employee not found</h2>
          <p className="text-sm text-zinc-500 mb-4">{error || "This employee does not exist or has been removed."}</p>
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  const emp = employee;
  const tenureMonths = Math.floor((Date.now() - new Date(emp.hireDate).getTime()) / (30 * 24 * 60 * 60 * 1000));
  const tenureDisplay = tenureMonths >= 12 ? `${Math.floor(tenureMonths / 12)}y ${tenureMonths % 12}m` : `${tenureMonths}m`;

  const deptPeers = allEmployees.filter((e) => e.department === emp.department && e.id !== emp.id);
  const avgDeptSalary = Math.round(deptPeers.reduce((s, e) => s + e.salary, 0) / (deptPeers.length || 1));

  return (
    <div className="min-h-full">
      <HRISStatus />
      <div className="p-6 max-w-[1000px] mx-auto space-y-6">
        <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-violet-700 dark:text-violet-300">
                {emp.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{emp.name}</h1>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  emp.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
                  emp.status === "on_leave" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  {emp.status === "on_leave" ? "On Leave" : emp.status}
                </span>
                {emp.attritionRisk && emp.attritionRisk.score >= 50 && (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    emp.attritionRisk.score >= 70 ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                  )}>
                    <AlertTriangle className="w-3 h-3" />
                    At Risk: {emp.attritionRisk.score}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400">{emp.position} · {emp.department}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-600" /></div>
              <div><p className="text-xs text-zinc-500">Email</p><p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.email}</p></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center"><Building2 className="w-4 h-4 text-violet-600" /></div>
              <div><p className="text-xs text-zinc-500">Department</p><p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.department}</p></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center"><Calendar className="w-4 h-4 text-emerald-600" /></div>
              <div><p className="text-xs text-zinc-500">Tenure</p><p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{tenureDisplay} (since {emp.hireDate})</p></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center"><DollarSign className="w-4 h-4 text-amber-600" /></div>
              <div><p className="text-xs text-zinc-500">Salary</p><p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">${(emp.salary / 1000).toFixed(0)}K {avgDeptSalary > emp.salary ? <span className="text-amber-500 text-xs">· below dept avg (${(avgDeptSalary / 1000).toFixed(0)}K)</span> : null}</p></div>
            </div>
          </div>
        </div>

        {/* Risk factors */}
        {emp.attritionRisk && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Attrition Risk Analysis</h2>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    emp.attritionRisk.score >= 70 ? "bg-red-500" : emp.attritionRisk.score >= 50 ? "bg-amber-500" : "bg-yellow-500"
                  )}
                  style={{ width: `${emp.attritionRisk.score}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{emp.attritionRisk.score}</span>
              <span className="text-xs text-zinc-500">/100</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk Factors:</p>
              {emp.attritionRisk.factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department context */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Department Context</h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {emp.name} is one of {deptPeers.length + 1} people in {emp.department}. The department average salary is ${(avgDeptSalary / 1000).toFixed(0)}K.
          </p>
        </div>
      </div>
    </div>
  );
}
