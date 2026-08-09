"use client";

import { toast } from "@/components/ui/toast";

export function showToast(type: "success" | "error" | "info" | "warning" | "loading", title: string, description?: string) {
  toast.add({
    type,
    title,
    description,
  });
}

export const notify = {
  success: (title: string, description?: string) => showToast("success", title, description),
  error: (title: string, description?: string) => showToast("error", title, description),
  info: (title: string, description?: string) => showToast("info", title, description),
  warning: (title: string, description?: string) => showToast("warning", title, description),
  loading: (title: string, description?: string) => showToast("loading", title, description),
};
