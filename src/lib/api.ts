// API client for the PeoplePulse backend (http://localhost:3002)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface ApiResponse<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pp_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `Request failed with status ${res.status}` };
    }
    return { success: true, data: json.data ?? json };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ========== Auth ==========

export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  plan?: "free" | "pro";
  createdAt?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data: {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companySize: string;
  industry: string;
}) {
  return apiFetch<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetMe() {
  return apiFetch<{ user: User }>("/api/auth/me");
}

// ========== Employees ==========

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "on_leave" | "terminated";
  hireDate: string;
  salary: number;
  attritionRisk?: { score: number; factors: string[] };
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
}

export async function apiGetEmployees(params?: {
  department?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.department) searchParams.set("department", params.department);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiFetch<EmployeeListResponse>(`/api/employees${qs ? `?${qs}` : ""}`);
}

export async function apiGetEmployee(id: string) {
  return apiFetch<{ employee: Employee }>(`/api/employees/${id}`);
}

// ========== Insights ==========

export interface Insight {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
}

export async function apiGetInsights() {
  return apiFetch<{ insights: Insight[] }>("/api/insights");
}

// ========== Reports ==========

export interface Report {
  id?: string;
  name: string;
  type: string;
  date?: string;
  status: "ready" | "generating";
}

export async function apiGetReports() {
  return apiFetch<{ reports: Report[] }>("/api/reports");
}

export async function apiGenerateReport(type: string) {
  return apiFetch<{ report: Report }>("/api/reports/generate", {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}

// ========== Stripe ==========

export async function apiCreateCheckoutSession() {
  return apiFetch<{ url: string }>("/api/stripe/checkout", {
    method: "POST",
  });
}
