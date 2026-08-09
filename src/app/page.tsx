"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp,
  Users,
  FileText,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Menu,
  X,
  Crown,
  Brain,
  Target,
  PieChart,
  Clock,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/providers";
import { cn } from "@/lib/utils";

// ─── Navigation ──────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { resolved, setTheme, theme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cycleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">PeoplePulse</span>
              <span className="hidden sm:block text-[10px] text-zinc-400 font-medium uppercase tracking-wider leading-none">
                HR Analytics
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg">
              Features
            </a>
            <a href="#how-it-works" className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg">
              How it works
            </a>
            <a href="#pricing" className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg">
              Pricing
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Get started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              How it works
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Pricing
            </a>
            <div className="pt-2 space-y-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-200/40 via-violet-100/20 to-transparent dark:from-violet-900/20 dark:via-violet-950/10 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gradient-to-b from-amber-200/20 to-transparent dark:from-amber-900/10 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-gradient-to-b from-blue-200/20 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 mb-8">
          <Zap className="w-3 h-3" />
          AI-powered HR analytics
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 max-w-4xl mx-auto leading-[1.1]">
          Turn your HR data into{" "}
          <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
            actionable insights
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Predict attrition before it happens, generate compliance reports in seconds,
          and make data-driven people decisions — all without a data science team.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5"
          >
            {user ? "Go to dashboard" : "Start free trial"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            See how it works
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: "147+", label: "Employees tracked" },
            { value: "94%", label: "Retention accuracy" },
            { value: "5min", label: "Setup time" },
            { value: "10+", label: "Report types" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Our Mistral 7B model analyzes your workforce data to surface hidden patterns, flight risks, and opportunities you'd never spot manually.",
    color: "violet",
  },
  {
    icon: Target,
    title: "Predictive Attrition",
    description:
      "Identify at-risk employees before they leave. Risk scores, contributing factors, and recommended retention actions for every team member.",
    color: "rose",
  },
  {
    icon: PieChart,
    title: "Smart Reports",
    description:
      "Generate turnover, diversity, compensation, recruiting, and compliance reports in one click. Share-ready PDFs, always audit-ready.",
    color: "amber",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description:
      "Live KPIs, headcount trends, department breakdowns, and turnover rates — all updated in real time across your entire organization.",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Compliance Ready",
    description:
      "Built-in compliance reporting for EEOC, GDPR, and SOC 2. Never scramble for an audit again. Your data is encrypted at rest and in transit.",
    color: "emerald",
  },
  {
    icon: Globe,
    title: "Multi-Source Integration",
    description:
      "Connect BambooHR, Workday, ADP, or upload CSVs. One unified view across your entire HR stack. Zero technical expertise required.",
    color: "cyan",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
};

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              master HR analytics
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            From predictive attrition to compliance reports — all in one platform.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
              >
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    colors.bg
                  )}
                >
                  <feature.icon className={cn("w-5 h-5", colors.text)} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────────────

const steps = [
  {
    step: "01",
    title: "Connect your HR stack",
    description:
      "Integrate with BambooHR, Workday, ADP, or upload a CSV. One click and your data is synced — no engineering required.",
    icon: Globe,
  },
  {
    step: "02",
    title: "AI analyzes your workforce",
    description:
      "PeoplePulse's AI engine scans for attrition risks, diversity gaps, compensation anomalies, and compliance issues automatically.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Act on real insights",
    description:
      "Get actionable recommendations, generate compliance-ready reports, and make data-driven decisions that retain your best talent.",
    icon: Target,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            From data to decisions in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              3 steps
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            No data science team. No complex setup. Just results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-violet-200 dark:from-violet-800 to-transparent" />
              )}

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-sm font-bold mb-5">
                  {step.step}
                </div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mb-5 shadow-sm">
                  <step.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing() {
  const { user } = useAuth();

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Start free. Upgrade when you need AI superpowers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <div className="relative p-8 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Users className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Free</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">For small teams</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-zinc-500 dark:text-zinc-400">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Up to 50 employees",
                "Basic dashboard & KPIs",
                "3 report types",
                "CSV import",
                "Email support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={user ? "/dashboard" : "/register"}
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {user ? "Go to dashboard" : "Start for free"}
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative p-8 rounded-2xl border-2 border-violet-500 bg-white dark:bg-zinc-900 shadow-xl shadow-violet-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-amber-500 text-white">
              MOST POPULAR
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                <Crown className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Pro</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">For growing companies</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">$49</span>
              <span className="text-zinc-500 dark:text-zinc-400">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Unlimited employees",
                "AI-powered insights (Mistral 7B)",
                "All 10 report types",
                "Predictive attrition scoring",
                "HRIS integrations (BambooHR, Workday, ADP)",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={user ? "/pricing" : "/register"}
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-lg shadow-violet-600/25"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection() {
  const { user } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to stop guessing about your workforce?
            </h2>
            <p className="text-lg text-violet-200 mb-10 max-w-xl mx-auto">
              Join hundreds of HR teams using PeoplePulse to predict attrition,
              generate reports, and make data-driven decisions.
            </p>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold bg-white hover:bg-zinc-100 text-violet-700 rounded-xl transition-colors shadow-lg"
            >
              {user ? "Go to dashboard" : "Start your free trial"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-sm text-violet-300">
              No credit card required · Free plan available · 5-minute setup
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">PeoplePulse</span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              HR analytics that actually works. AI-powered insights for modern people teams.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a></li>
              <li><Link href="/login" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Sign in</Link></li>
              <li><Link href="/register" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Sign up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} PeoplePulse. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Built with &hearts; for HR teams everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main landing page ──────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();

  // If user is logged in, show a redirect to dashboard instead
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Your dashboard is ready.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
          >
            Go to dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
