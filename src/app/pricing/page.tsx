"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp,
  Check,
  Zap,
  BarChart3,
  Link2,
  FileText,
  HeadphonesIcon,
  Brain,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const freeFeatures = [
  { text: "Basic analytics dashboard", included: true },
  { text: "1 HRIS connection", included: true },
  { text: "5 reports per month", included: true },
  { text: "Employee directory", included: true },
  { text: "AI insights via Hugging Face", included: false },
  { text: "Unlimited reports", included: false },
  { text: "Unlimited HRIS connections", included: false },
  { text: "Priority support", included: false },
];

const proFeatures = [
  { text: "Full analytics suite", included: true },
  { text: "Unlimited HRIS connections", included: true },
  { text: "AI insights via Hugging Face", included: true },
  { text: "Unlimited reports", included: true },
  { text: "Priority email & chat support", included: true },
  { text: "Advanced attrition prediction", included: true },
  { text: "Custom dashboards", included: true },
  { text: "API access", included: true },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, upgradeToPro } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const isPro = user?.plan === "pro";

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?redirect=pricing");
      return;
    }
    setIsUpgrading(true);
    const url = await upgradeToPro();
    setIsUpgrading(false);
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">PeoplePulse</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Start free and upgrade when you need deeper insights. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Toggle + Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Free</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">For small teams getting started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-1">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0">--</span>
                  )}
                  <span className={f.included ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="text-center py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                You&apos;re on Pro plan
              </div>
            ) : (
              <Link
                href={user ? "/" : "/register"}
                className="block text-center py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-violet-500 dark:border-violet-600 p-8 flex flex-col relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-violet-600 text-white text-xs font-semibold">
              Most Popular
            </span>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Pro</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">For growing companies that need more</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$29</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-1">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-300">{f.text}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="text-center py-2.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-sm text-violet-700 dark:text-violet-300 font-medium">
                Your current plan
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Upgrade to Pro
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
