"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Terminal, Activity, ArrowUpRight, Cpu } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

const NAV_ITEMS = [
  { id: "pipeline", label: "LangGraph Pipeline" },
  { id: "direct-answer", label: "Direct Answer Density" },
  { id: "entity-saturation", label: "Entity Saturation" },
  { id: "information-gain", label: "Information Gain" },
  { id: "knowledge-graph", label: "Knowledge Graph" }
];

export const Header: React.FC = () => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const [activeNav, setActiveNav] = useState<string>("pipeline");

  useEffect(() => {
    checkBackendHealth().then(setIsBackendOnline);
    const interval = setInterval(() => {
      checkBackendHealth().then(setIsBackendOnline);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTabEvent = (e: any) => {
      if (e.detail) {
        setActiveNav(e.detail);
      }
    };
    window.addEventListener("aio-tab-select", handleTabEvent);
    return () => window.removeEventListener("aio-tab-select", handleTabEvent);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (typeof window !== "undefined") {
      window.location.hash = id;
      window.dispatchEvent(new CustomEvent("aio-tab-select", { detail: id }));
    }
  };

  return (
    <header className="border-b border-white/[0.06] bg-[#07090e]/85 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => handleNavClick("metrics")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 group-hover:scale-105 transition">
            <Cpu className="h-4 w-4 text-black font-black" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">AIO & GEO</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              v2.0 Production
            </span>
          </div>
        </div>

        {/* Center Nav Pills (Interactive Navigation Bar) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-400 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold border border-white/[0.08]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & OpenAPI */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border bg-white/[0.02] border-white/[0.08]">
            <span
              className={`h-2 w-2 rounded-full ${
                isBackendOnline === true
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : isBackendOnline === false
                  ? "bg-rose-400 shadow-[0_0_8px_#f43f5e]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-slate-300">
              {isBackendOnline === true
                ? "Serverless: Ready"
                : isBackendOnline === false
                ? "API Offline"
                : "Connecting..."}
            </span>
          </div>

          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition shadow-sm"
          >
            <span>OpenAPI</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  );
};
