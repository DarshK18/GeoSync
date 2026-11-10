"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Table as TableIcon,
  Bot,
  Terminal,
  Download,
  Split,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Search,
  BookOpen,
  Cpu,
  Zap,
  Globe
} from "lucide-react";
import { FullAnalysisResponse } from "@/types/seo";

interface ReportDashboardProps {
  data: FullAnalysisResponse;
}

export const ReportSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Tab bar skeleton */}
      <div className="h-10 w-full max-w-md bg-white/[0.04] rounded-xl border border-white/[0.06]" />

      {/* Hero Score Card Skeleton */}
      <div className="p-8 rounded-2xl bg-[#090b10] border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full border-4 border-slate-800 bg-slate-900" />
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-36 bg-slate-800 rounded" />
            <div className="h-3 w-28 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="md:col-span-2 space-y-3">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="h-16 w-full bg-slate-800/60 rounded-xl" />
        </div>
      </div>

      {/* 5D Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-[#0b0d13] border border-white/[0.06] p-4 space-y-2">
            <div className="h-4 w-16 bg-slate-800 rounded" />
            <div className="h-6 w-12 bg-slate-800 rounded" />
            <div className="h-2 w-full bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Body content skeleton */}
      <div className="h-64 rounded-2xl bg-[#090b10] border border-white/[0.08]" />
    </div>
  );
};

export const ReportDashboard: React.FC<ReportDashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "schema" | "restructure" | "crawlers">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    geo_score,
    schema_recommendations,
    transformation,
    simulation,
    crawler_configs,
    scraped_summary,
    target_entity,
    request_url
  } = data;

  const copyToClipboard = (text: string, key: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info(`Downloaded ${filename}`);
  };

  // Score meter math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (geo_score.overall_score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 85) return { stroke: "stroke-emerald-400", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (score >= 70) return { stroke: "stroke-cyan-400", text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    if (score >= 55) return { stroke: "stroke-amber-400", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { stroke: "stroke-rose-400", text: "text-rose-400", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  };

  const scoreTheme = getScoreColor(geo_score.overall_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Tab Navigation (typesafe.ai minimal aesthetic) */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Audit & 5D Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Citation Simulator</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {Math.round(simulation.citation_success_rate * 100)}% CSR
            </span>
          </button>
          <button
            onClick={() => setActiveTab("restructure")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "restructure"
                ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Split className="h-3.5 w-3.5 text-indigo-400" />
            <span>RAG Content Diff</span>
            {transformation.anaphora_replacements_count > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {transformation.anaphora_replacements_count} Fixed
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "schema"
                ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Schema.org Graph ({schema_recommendations.entities_grounded.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("crawlers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "crawlers"
                ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Crawler Directives</span>
          </button>
        </div>

        {/* Target Entity Pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">Target Entity:</span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
            {target_entity}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & 5D SCORE MATRIX */}
        {/* ============================================================== */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Hero Banner: RRI Score & Citation Probability */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#090b10] border border-white/[0.08] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Radial Gauge */}
                <div className="lg:col-span-4 flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-white/[0.06]"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${scoreTheme.stroke} transition-all duration-1000 ease-out`}
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black font-mono text-white">
                        {Math.round(geo_score.overall_score)}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        RRI Score
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-slate-400">Grade:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-black font-mono border ${scoreTheme.badge}`}>
                        {geo_score.grade}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {geo_score.overall_score >= 80 ? "Exceptional RAG Readiness" : geo_score.overall_score >= 60 ? "Moderate RAG Readiness" : "High Degradation Risk"}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {geo_score.citation_prediction.tier} Citation Likelihood ({Math.round(geo_score.citation_prediction.primary_citation_probability * 100)}% Primary)
                    </p>
                  </div>
                </div>

                {/* Scraped URL Telemetry Summary */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Word Count</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {scraped_summary.word_count.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      ~{scraped_summary.reading_time_minutes} min read
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Content/HTML</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {Math.round(scraped_summary.content_to_html_ratio * 100)}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      DOM Boilerplate Clean
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Tables & Lists</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {scraped_summary.table_count} tables
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Structured extraction
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Headings</div>
                    <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                      {scraped_summary.h1_count} H1 • {scraped_summary.h2_count} H2
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Hierarchical outline
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Qualitative Insight Banner (if available) */}
              {geo_score.ai_insight && (
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        LLM Cognitive Assessment
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase">
                        via {geo_score.ai_insight.provider_used}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {geo_score.ai_insight.executive_assessment}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 5-Dimensional Metric Breakdown Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                5D Generative Engine Optimization Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {Object.entries(geo_score.dimensions).map(([key, dim]) => (
                  <div
                    key={key}
                    className="p-4 rounded-xl bg-[#090b10] border border-white/[0.06] hover:border-white/[0.12] transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-slate-400 truncate pr-1">{dim.name}</span>
                        <span className="font-bold text-white">{Math.round(dim.score)}</span>
                      </div>
                      <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full ${
                            dim.score >= 80 ? "bg-emerald-400" : dim.score >= 60 ? "bg-cyan-400" : "bg-amber-400"
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {dim.recommendations[0] || "Optimized for retrieval context."}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-500">
                      Weight: {Math.round(dim.weight * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Priority Remediation Checklist */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Actionable Priority Remediation Checklist
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {geo_score.actionable_checklist.length} high-impact actions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {geo_score.actionable_checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition flex items-start gap-3 group"
                  >
                    <span className="font-mono text-xs text-cyan-400 font-bold mt-0.5">
                      0{idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed flex-1">
                      {item}
                    </p>
                    <button
                      onClick={() => copyToClipboard(item, `action-${idx}`, "Remediation step")}
                      className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-white"
                      title="Copy recommendation"
                    >
                      {copiedKey === `action-${idx}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI CITATION SIMULATOR */}
        {/* ============================================================== */}
        {activeTab === "simulator" && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Engine Probability Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {simulation.engine_breakdown.map((engine) => (
                <div
                  key={engine.engine_name}
                  className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{engine.engine_name}</span>
                    <Bot className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-black font-mono text-white">
                      {Math.round(engine.estimated_inclusion_rate * 100)}%
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Inclusion Rate ({Math.round(engine.primary_citation_rate * 100)}% Primary [1])
                    </div>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                    {engine.risk_factors.map((risk, rIdx) => (
                      <div key={rIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-Intent Simulated Queries & Cross-Encoder Survival */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Simulated User Prompts & Cross-Encoder Attention
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modeled across Informational, Comparative, Conceptual, and Troubleshooting search intents.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                  {Math.round(simulation.average_token_share * 100)}% Token Share
                </div>
              </div>

              <div className="space-y-3">
                {simulation.query_details.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300 uppercase">
                          {q.intent_type}
                        </span>
                        <span className="text-xs font-semibold text-white">
                          "{q.query}"
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {q.target_cited ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Cited Rank #{q.citation_rank}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Pruned in Reranking
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-500">
                          Rank Score: {Math.round(q.rank_position_score * 100)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#07080c] border border-white/[0.04] text-xs font-mono text-slate-300 leading-relaxed">
                      <span className="text-slate-500 select-none mr-2">&gt;</span>
                      {q.simulated_answer_snippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SCHEMA.ORG INTERCONNECTED GRAPH */}
        {/* ============================================================== */}
        {activeTab === "schema" && (
          <motion.div
            key="schema"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Machine-Validated Schema.org Knowledge Graph</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      @graph Architecture
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Embeds TechArticle, WebSite, Organization, FAQPage, and Wikidata URI Entity Grounding.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(schema_recommendations.formatted_script_tag, "schema-tag", "Schema script tag")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
                  >
                    {copiedKey === "schema-tag" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Script Tag</span>
                  </button>
                  <button
                    onClick={() => downloadFile(JSON.stringify(schema_recommendations.jsonld_payload, null, 2), "schema-graph.jsonld", "application/ld+json")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON-LD</span>
                  </button>
                </div>
              </div>

              {/* Wikidata Grounded Entities Pills */}
              {schema_recommendations.entities_grounded.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-500">
                    Grounded Wikidata Knowledge Entities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {schema_recommendations.entities_grounded.map((ent, idx) => (
                      <a
                        key={idx}
                        href={ent.wikidata_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.03] hover:bg-white/[0.06] text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition"
                      >
                        <span>{ent.name}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Viewer (Dark-mode Monaco/CodeMirror styled block) */}
              <div className="rounded-xl border border-white/[0.08] bg-[#050608] overflow-hidden">
                <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-slate-500 ml-2">application/ld+json</span>
                  </div>
                  <span>{JSON.stringify(schema_recommendations.jsonld_payload).length} bytes</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed selection:bg-cyan-500 selection:text-black">
                  {JSON.stringify(schema_recommendations.jsonld_payload, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: RAG CONTENT RESTRUCTURING & ANAPHORA FIXES */}
        {/* ============================================================== */}
        {activeTab === "restructure" && (
          <motion.div
            key="restructure"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* BLUF Direct Answer Box */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-bold">
                    Inverted Pyramid BLUF (Bottom Line Up Front) Recommendation
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(transformation.bluf_paragraph, "bluf-copy", "BLUF paragraph")}
                  className="px-2.5 py-1 rounded text-xs font-mono text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition flex items-center gap-1"
                >
                  {copiedKey === "bluf-copy" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>Copy BLUF</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {transformation.bluf_paragraph}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Inject this paragraph immediately below your H1 tag to capture direct answer extraction from Gemini and Perplexity.
              </p>
            </div>

            {/* Restructured Markdown Chunks */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    RAG-Optimized Content Sections (Vector Chunk Friendly)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formatted in semantic Markdown with resolved pronoun anaphora.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(transformation.restructured_markdown, "full-md", "Restructured markdown")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
                >
                  {copiedKey === "full-md" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Markdown</span>
                </button>
              </div>

              <div className="space-y-3">
                {transformation.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {sec.heading}
                      </span>
                      {sec.is_table && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                          <TableIcon className="h-3 w-3" />
                          Table Matrix
                        </span>
                      )}
                    </div>
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {sec.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: AI CRAWLER CONFIGURATIONS (ROBOTS & LLMS.TXT) */}
        {/* ============================================================== */}
        {activeTab === "crawlers" && (
          <motion.div
            key="crawlers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* robots.txt */}
              <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">AI-Optimized robots.txt</h3>
                      <p className="text-xs text-slate-400">Explicitly whitelists modern AI crawlers.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(crawler_configs.robots_txt, "robots-copy", "robots.txt")}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
                        title="Copy robots.txt"
                      >
                        {copiedKey === "robots-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadFile(crawler_configs.robots_txt, "robots.txt", "text/plain")}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                        title="Download robots.txt"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#050608] border border-white/[0.04] text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                    {crawler_configs.robots_txt}
                  </pre>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Place in your public/ root to grant Google-Extended, PerplexityBot, and GPTBot unobstructed crawl access.
                </p>
              </div>

              {/* llms.txt */}
              <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Emerging Standard: /llms.txt</h3>
                      <p className="text-xs text-slate-400">Context summary file ingested by Claude & Perplexity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(crawler_configs.llms_txt, "llms-copy", "llms.txt")}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
                        title="Copy llms.txt"
                      >
                        {copiedKey === "llms-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => downloadFile(crawler_configs.llms_txt, "llms.txt", "text/plain")}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                        title="Download llms.txt"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#050608] border border-white/[0.04] text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                    {crawler_configs.llms_txt}
                  </pre>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Provides LLM crawlers with clean markdown context without needing to render heavy client JS.
                </p>
              </div>
            </div>

            {/* Recommended Cloudflare & Vercel Edge Rules */}
            {crawler_configs.recommended_edge_rules.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Recommended Edge & CDN Directives (Vercel / Cloudflare)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {crawler_configs.recommended_edge_rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono text-slate-300 flex items-center gap-2"
                    >
                      <span className="text-cyan-400 font-bold">&gt;</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Re-export as GeoReport for backward compatibility
export const GeoReport = ReportDashboard;
