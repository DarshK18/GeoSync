"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Layers,
  Table as TableIcon,
  Database,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Flame
} from "lucide-react";
import { ScoreImprovementPlan as PlanType, ActionItem } from "@/types/aio";

interface ScoreImprovementPlanProps {
  plan: PlanType;
  targetEntity: string;
}

export const ScoreImprovementPlan: React.FC<ScoreImprovementPlanProps> = ({
  plan,
  targetEntity
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [appliedActions, setAppliedActions] = useState<Record<number, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleAction = (idx: number) => {
    setAppliedActions((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      const action = plan.actions[idx];
      if (next[idx]) {
        toast.success(`Simulated fix applied: ${action.title} (+${action.impact_points} pts)`);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string, key: string, label: string = "Template") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate simulated score based on toggled actions
  const appliedGain = plan.actions.reduce((acc, act, idx) => {
    return acc + (appliedActions[idx] ? act.impact_points * 0.5 : 0);
  }, 0);
  const simulatedScore = Math.min(99.0, Math.round(plan.current_score + appliedGain));

  const categories = [
    "All",
    "Direct Answer Density",
    "Entity Saturation",
    "Information Gain",
    "Knowledge Graph",
    "LangGraph Pipeline"
  ];

  const filteredActions = plan.actions.filter((act) => {
    if (selectedCategory === "All") return true;
    return act.category === selectedCategory;
  });

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Score Projection Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090b10] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Current vs Projected Meter */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-6">
            {/* Current Score Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center min-w-[120px]">
              <span className="text-[10px] font-mono uppercase text-slate-500">Current Score</span>
              <div className="text-3xl font-black font-mono text-slate-300 mt-1">
                {Math.round(plan.current_score)}
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">Grade {plan.current_grade}</span>
            </div>

            <ArrowRight className="h-6 w-6 text-cyan-400 animate-pulse hidden sm:block" />

            {/* Simulated / Projected Score Box */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center min-w-[140px] shadow-lg shadow-cyan-500/10">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Simulated Score</span>
              <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                {simulatedScore}
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Grade {simulatedScore >= 90 ? "A+" : simulatedScore >= 80 ? "A" : "B"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +{Math.round(plan.projected_score - plan.current_score)} PTS POTENTIAL
                </span>
                <span className="text-xs font-mono text-slate-400">• High Impact</span>
              </div>
              <h3 className="text-base font-bold text-white">
                RAG Citation Dominance Roadmap
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Follow the 5 specific remediations below to boost your document into the top-1 context window of Gemini, ChatGPT, and Perplexity.
              </p>
            </div>
          </div>

          {/* Interactive Simulation Summary */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-[#06070a] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Interactive Simulation:</span>
              <span className="text-cyan-400 font-bold">
                {Object.values(appliedActions).filter(Boolean).length} of {plan.actions.length} Applied
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Toggle the checkboxes on the cards below to simulate your score progression in real-time.
            </p>
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(simulatedScore / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        {categories.map((cat) => {
          const count = cat === "All" ? plan.actions.length : plan.actions.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{cat}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.06] text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Action Cards Grid */}
      <div className="space-y-4">
        {filteredActions.map((action, idx) => {
          const globalIdx = plan.actions.findIndex((a) => a.title === action.title);
          const isApplied = !!appliedActions[globalIdx];

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-[#090b10] border transition-all space-y-4 ${
                isApplied
                  ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5 bg-[#070b09]"
                  : "border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isApplied}
                    onChange={() => toggleAction(globalIdx)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-[#06070a] cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                        {action.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          action.priority === "Critical"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : action.priority === "High"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}
                      >
                        {action.priority} Priority
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{action.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    +{action.impact_points} PTS GAIN
                  </span>
                  <button
                    onClick={() => copyToClipboard(action.copyable_template, `tpl-${idx}`, `${action.category} template`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
                  >
                    {copiedKey === `tpl-${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>Copy Fix</span>
                  </button>
                </div>
              </div>

              {/* Diagnosis & Exact Remediation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[10px] text-rose-400 uppercase font-bold">Detected Structural Gap:</span>
                  <p className="text-slate-400 leading-relaxed">{action.current_gap}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Exact Step-by-Step Remediation:</span>
                  <p className="text-slate-300 leading-relaxed">{action.exact_remediation}</p>
                </div>
              </div>

              {/* Copyable Template Code Block */}
              <div className="rounded-xl border border-white/[0.06] bg-[#050608] overflow-hidden">
                <div className="px-3.5 py-1.5 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Ready-to-Paste Remediation Snippet</span>
                  <span className="text-cyan-400">Click Copy Fix above to apply</span>
                </div>
                <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
                  {action.copyable_template}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
