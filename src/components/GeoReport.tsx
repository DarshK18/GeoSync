"use client";

import React, { useState } from "react";
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
  FileCode
} from "lucide-react";
import { FullAnalysisResponse } from "@/types/seo";

interface GeoReportProps {
  data: FullAnalysisResponse;
}

export const GeoReport: React.FC<GeoReportProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "schema" | "restructure" | "crawlers">("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    geo_score,
    schema_recommendations,
    transformation,
    simulation,
    crawler_configs,
    scraped_summary,
    target_entity
  } = data;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
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
  };

  // Score meter math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (geo_score.overall_score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "stroke-emerald-400 text-emerald-400";
    if (score >= 70) return "stroke-cyan-400 text-cyan-400";
    if (score >= 55) return "stroke-amber-400 text-amber-400";
    return "stroke-rose-400 text-rose-400";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Tab Navigation (typesafe.ai minimal aesthetic) */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Audit & 5D Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-white/[0.08] text-white shadow-sm"
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
                ? "bg-white/[0.08] text-white shadow-sm"
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
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Schema.org Graph ({schema_recommendations.entities_grounded.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("crawlers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === "crawlers"
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Crawler Specs (llms.txt)</span>
          </button>
        </div>

        {/* Export Dropdown / Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadFile(JSON.stringify(data, null, 2), `aiseo-audit-${target_entity.replace(/\s+/g, "-").toLowerCase()}.json`, "application/json")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition"
            title="Export complete audit telemetry as JSON"
          >
            <Download className="h-3 w-3 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE AUDIT & 5D MATRIX */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* RRI Score Card */}
            <div className="typesafe-card rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                RAG-Readiness Index (RRI)
              </span>
              <div className="relative flex items-center justify-center my-1">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className={getScoreColor(geo_score.overall_score)}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-white">{geo_score.overall_score}</span>
                  <span className="text-[10px] text-slate-500 font-mono">/ 100</span>
                </div>
              </div>
              <span className="mt-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-white/[0.06] text-cyan-400 border border-white/[0.08]">
                Grade {geo_score.grade}
              </span>
            </div>

            {/* Citation Prediction */}
            <div className="typesafe-card rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Predicted Citation Placement
                </span>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{geo_score.citation_prediction.tier}</span>
                  <span className="text-xs text-slate-400">Tier</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Est. Primary <strong className="text-cyan-400 font-mono">[1]</strong> Anchor Probability:{" "}
                  <strong className="text-white font-semibold">
                    {Math.round(geo_score.citation_prediction.primary_citation_probability * 100)}%
                  </strong>
                </p>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.round(geo_score.citation_prediction.primary_citation_probability * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Content Scope */}
            <div className="typesafe-card rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Clean Context Window Scope
                </span>
                <div className="mt-2.5">
                  <span className="text-2xl font-bold text-white">{scraped_summary.word_count}</span>
                  <span className="text-xs text-slate-400 ml-1.5">tokens / words</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Est. Reading Time: <strong className="text-slate-200">{scraped_summary.reading_time_minutes} min</strong>
                </p>
              </div>

              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mt-4">
                <CheckCircle2 className="h-3 w-3" />
                <span>Text-to-HTML: {Math.round(scraped_summary.content_to_html_ratio * 100)}% (Purged)</span>
              </div>
            </div>

            {/* Entity Graph Grounding */}
            <div className="typesafe-card rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Knowledge Graph Grounding
                </span>
                <div className="mt-2.5">
                  <span className="text-2xl font-bold text-cyan-400">
                    {schema_recommendations.entities_grounded.length}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">Wikidata URIs</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {schema_recommendations.faq_count} Structured Q&A Pairs
                </p>
              </div>

              <div className="text-[11px] font-mono text-indigo-400 mt-4">
                {schema_recommendations.schema_type}
              </div>
            </div>
          </div>

          {/* AI Qualitative Assessment Card (If available) */}
          {geo_score.ai_insight && (
            <div className="typesafe-card-highlight rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                    AiSeo Executive AI Assessment ({geo_score.ai_insight.provider_used.toUpperCase()})
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(geo_score.ai_insight?.suggested_bluf_hook || "", "hook")}
                  className="px-2.5 py-1 rounded text-[11px] font-mono bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] transition flex items-center gap-1.5"
                >
                  {copiedKey === "hook" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedKey === "hook" ? "Hook Copied" : "Copy Suggested Lead"}</span>
                </button>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-sans mb-4">
                {geo_score.ai_insight.executive_assessment}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                    Recommended BLUF Lead Hook:
                  </span>
                  <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 leading-relaxed">
                    &ldquo;{geo_score.ai_insight.suggested_bluf_hook}&rdquo;
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                    Missing High-Salience Latent Entities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {geo_score.ai_insight.missing_latent_entities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                      >
                        + {ent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5-Dimensional Breakdown */}
          <div className="typesafe-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                <span>5-Dimensional GEO Mathematical Breakdown</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Cross-Encoder Optimization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(geo_score.dimensions).map(([k, dim]) => (
                <div key={k} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block truncate">{dim.name}</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-white">{dim.score}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 mt-2.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-1 rounded-full"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Action Items */}
          <div className="typesafe-card rounded-2xl p-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Prioritized GEO Remediation Actions</span>
            </h3>

            {geo_score.actionable_checklist.length > 0 ? (
              <ul className="space-y-2">
                {geo_score.actionable_checklist.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-300 font-mono"
                  >
                    <span className="h-5 w-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="h-4 w-4" />
                <span>Content is mathematically optimal for RAG retrieval and citation synthesis.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI CITATION SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <div className="typesafe-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>Empirical Multi-Intent Citation Simulation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Simulating user search queries against cross-encoders and generative models (Perplexity, SearchGPT, Gemini).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Citation Rate:</span>
                  <span className="text-base font-bold text-white">{Math.round(simulation.citation_success_rate * 100)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mean Rank Score:</span>
                  <span className="text-base font-bold text-cyan-400">{simulation.mean_rank_position_score}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Token Share:</span>
                  <span className="text-base font-bold text-indigo-400">{Math.round(simulation.average_token_share * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Engine Inclusion Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {simulation.engine_breakdown.map((eng, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-xs font-bold text-white mb-1">{eng.engine_name}</div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 my-1">
                    <span>Est. Context Inclusion:</span>
                    <span className="text-cyan-400 font-semibold">{Math.round(eng.estimated_inclusion_rate * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 my-1">
                    <span>Primary [1] Win Rate:</span>
                    <span className="text-emerald-400 font-semibold">{Math.round(eng.primary_citation_rate * 100)}%</span>
                  </div>
                  {eng.risk_factors.length > 0 && (
                    <p className="text-[10px] text-amber-400 mt-2 font-mono leading-tight">
                      ⚠️ {eng.risk_factors[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Simulated Queries */}
          <div className="typesafe-card rounded-2xl p-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">
              Simulated Query Scenarios & Cross-Encoder Survival
            </h4>

            <div className="space-y-3">
              {simulation.query_details.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                        {q.intent_type}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">&ldquo;{q.query}&rdquo;</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className={q.survived_cross_encoder ? "text-emerald-400" : "text-rose-400"}>
                        {q.survived_cross_encoder ? "✓ Cross-Encoder Passed" : "✗ Pruned by Reranker"}
                      </span>
                      {q.target_cited && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Cited at [{q.citation_rank}]
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#06070a] text-xs font-mono text-slate-300 border border-white/[0.04]">
                    <span className="text-slate-500 block text-[10px] uppercase mb-1">Synthesized Model Answer:</span>
                    {q.simulated_answer_snippet}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RAG CONTENT DIFF & RESTRUCTURING */}
      {activeTab === "restructure" && (
        <div className="space-y-6">
          {/* Header & Badges */}
          <div className="typesafe-card rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Split className="h-4 w-4" />
                  <span>AiSeo RAG Restructuring & Optimization Diff</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Engineered using Inverted Pyramid BLUF structure, natural language query subheadings, and comparative matrices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(transformation.restructured_markdown, "md")}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-mono flex items-center gap-2 transition"
                >
                  {copiedKey === "md" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === "md" ? "Copied!" : "Copy Full Markdown"}</span>
                </button>
                <button
                  onClick={() => downloadFile(transformation.restructured_markdown, `${target_entity.replace(/\s+/g, "-").toLowerCase()}-rag-optimized.md`, "text/markdown")}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono flex items-center gap-2 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Metric Transformation Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Anaphora Resolved</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">
                  {transformation.anaphora_replacements_count} Pronouns Replaced
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Context severed in chunking eliminated</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Comparative Matrix</span>
                <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">
                  Injected & Formatted
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Prioritizes tabular cross-encoder tokens</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Lead Definition Location</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                  First 45 Tokens
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">Survives aggressive context truncation</span>
              </div>
            </div>
          </div>

          {/* Side-by-side or stacked diff view */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Original Scraped Opening */}
            <div className="typesafe-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                  Original Scraped Opening (Pre-Optimization)
                </span>
                <span className="text-[10px] font-mono text-slate-500">Unstructured</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] text-xs font-mono text-slate-400 leading-relaxed max-h-96 overflow-y-auto">
                {data.scraped_summary.meta_description || transformation.bluf_paragraph}
                <div className="mt-3 text-slate-500 text-[11px] italic">
                  Note: Conventional introductions often scatter the subject predicate, increasing pronoun drift and lowering cross-encoder rank.
                </div>
              </div>
            </div>

            {/* Right: AiSeo RAG-Optimized BLUF */}
            <div className="typesafe-card-highlight rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  AiSeo Inverted Pyramid BLUF (Post-Optimization)
                </span>
                <span className="text-[10px] font-mono text-cyan-300">RAG Ready</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-cyan-500/20 text-xs font-mono text-cyan-100 leading-relaxed max-h-96 overflow-y-auto">
                <div className="font-semibold text-white mb-2">{transformation.bluf_paragraph}</div>
                <div className="text-xs text-slate-300 whitespace-pre-wrap mt-3 border-t border-white/[0.08] pt-3 font-mono">
                  {transformation.sections.slice(1, 3).map((s, i) => (
                    <div key={i} className="mb-3">
                      <div className="text-cyan-400 font-bold mb-1">{s.heading}</div>
                      <div className="text-slate-300 text-[11px]">{s.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA.ORG JSON-LD */}
      {activeTab === "schema" && (
        <div className="typesafe-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                <span>Interconnected Schema.org Knowledge Graph</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Machine-validated linked data tying your domain directly to canonical Wikidata URIs.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(schema_recommendations.formatted_script_tag, "schema")}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-mono flex items-center gap-2 transition"
            >
              {copiedKey === "schema" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey === "schema" ? "Copied!" : "Copy Script Tag"}</span>
            </button>
          </div>

          {/* Grounded Entities Chips */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-2">Canonical Entities Grounded:</span>
            <div className="flex flex-wrap gap-2">
              {schema_recommendations.entities_grounded.map((ent, i) => (
                <a
                  key={i}
                  href={ent.wikidata_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.03] border border-white/[0.08] text-cyan-300 hover:border-cyan-500 transition"
                >
                  <span>{ent.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div className="rounded-xl border border-white/[0.06] bg-[#07080c] p-4">
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-[450px] leading-relaxed">
              <code>{schema_recommendations.formatted_script_tag}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 5: CRAWLER SPECS (robots.txt & llms.txt) */}
      {activeTab === "crawlers" && (
        <div className="space-y-6">
          {/* llms.txt Spec */}
          <div className="typesafe-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>/llms.txt Specification</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Token-efficient Markdown knowledge map for AI crawlers without HTML parsing overhead.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(crawler_configs.llms_txt, "llms")}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-mono flex items-center gap-2 transition"
                >
                  {copiedKey === "llms" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === "llms" ? "Copied!" : "Copy /llms.txt"}</span>
                </button>
                <button
                  onClick={() => downloadFile(crawler_configs.llms_txt, "llms.txt", "text/plain")}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#07080c] p-4">
              <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-60 leading-relaxed">
                <code>{crawler_configs.llms_txt}</code>
              </pre>
            </div>
          </div>

          {/* robots.txt Spec */}
          <div className="typesafe-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span>AI-Crawler-Optimized robots.txt</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Grants explicit high-priority access to GPTBot, PerplexityBot, ClaudeBot, and Google-Extended.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(crawler_configs.robots_txt, "robots")}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-mono flex items-center gap-2 transition"
                >
                  {copiedKey === "robots" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === "robots" ? "Copied!" : "Copy robots.txt"}</span>
                </button>
                <button
                  onClick={() => downloadFile(crawler_configs.robots_txt, "robots.txt", "text/plain")}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#07080c] p-4">
              <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-60 leading-relaxed">
                <code>{crawler_configs.robots_txt}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
