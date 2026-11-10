"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Bot,
  Table as TableIcon,
  TrendingUp,
  FileCode,
  ShieldCheck,
  Zap,
  Split,
  Download
} from "lucide-react";
import { GeoAnalysisResponse } from "@/types/aio";

interface GeoMetricsProps {
  data: GeoAnalysisResponse;
}

export const GeoMetrics: React.FC<GeoMetricsProps> = ({ data }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    rag_readiness,
    entity_graph,
    generative_snippets,
    scraped_telemetry,
    target_entity,
    schema_jsonld,
    formatted_schema_tag,
    crawler_directives
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
  const strokeDashoffset = circumference - (rag_readiness.overall_score / 100) * circumference;

  const getScoreTheme = (score: number) => {
    if (score >= 85) return { stroke: "stroke-emerald-400", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (score >= 70) return { stroke: "stroke-cyan-400", text: "text-cyan-400", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    if (score >= 55) return { stroke: "stroke-amber-400", text: "text-amber-400", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { stroke: "stroke-rose-400", text: "text-rose-400", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  };

  const theme = getScoreTheme(rag_readiness.overall_score);

  return (
    <div className="w-full space-y-6">
      {/* 1. Hero Score Matrix & Citation Probability */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#090b10] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radial Meter */}
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
                  className={`${theme.stroke} transition-all duration-1000 ease-out`}
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-white">
                  {Math.round(rag_readiness.overall_score)}
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  RRI Index
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">Grade:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-black font-mono border ${theme.badge}`}>
                  {rag_readiness.letter_grade}
                </span>
                <span className="text-xs font-mono text-slate-500">• {rag_readiness.tier}</span>
              </div>
              <div className="text-sm font-bold text-white">
                {rag_readiness.overall_score >= 80
                  ? "Top-Tier RAG Readiness"
                  : rag_readiness.overall_score >= 60
                  ? "Moderate Retrieval Friction"
                  : "High Cross-Encoder Pruning Risk"}
              </div>
              <p className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>{rag_readiness.citation_probability_score}% Citation Probability</span>
              </p>
            </div>
          </div>

          {/* Scraped Telemetry Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Word Count</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {scraped_telemetry.word_count.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                ~{scraped_telemetry.reading_time_minutes} min read
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Information Gain</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {scraped_telemetry.data_points_count} data pts
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {scraped_telemetry.table_count} tables
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Entity Salience</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {Math.round(entity_graph.salience_score * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {entity_graph.pronoun_anaphora_drift_count} anaphora drift
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Content/HTML</div>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {Math.round(scraped_telemetry.content_to_html_ratio * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Boilerplate purged
              </div>
            </div>
          </div>
        </div>

        {/* Wikidata Linked Entities Bar */}
        {Object.keys(entity_graph.wikidata_links).length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">
              Wikidata Grounded Entities:
            </span>
            {Object.entries(entity_graph.wikidata_links).map(([name, uri]) => (
              <a
                key={name}
                href={uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition"
              >
                <span>{name}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 2. Three Core AIO Pillars Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          AIO Core Evaluation Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(rag_readiness.dimensions).map(([key, dim]) => (
            <div
              key={key}
              className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.06] hover:border-white/[0.12] transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white text-sm">{dim.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    dim.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    dim.score >= 55 ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {dim.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black font-mono text-white">
                    {Math.round(dim.score)}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full ${
                      dim.score >= 80 ? "bg-emerald-400" : dim.score >= 55 ? "bg-cyan-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {dim.diagnosis}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.04] space-y-1">
                {dim.recommendations.slice(0, 2).map((rec, rIdx) => (
                  <div key={rIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Per-Engine Cross-Encoder Predictions */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Per-Engine Cross-Encoder Citation Forecast
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {generative_snippets.per_engine_predictions.map((engine) => (
            <div
              key={engine.engine_name}
              className="p-4 rounded-xl bg-[#090b10] border border-white/[0.06] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{engine.engine_name}</span>
                <Bot className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="text-xl font-black font-mono text-white">
                {Math.round(engine.inclusion_probability * 100)}%
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Inclusion Rate ({Math.round(engine.primary_anchor_probability * 100)}% Primary Anchor)
              </div>
              {engine.retrieval_friction_points.length > 0 && (
                <div className="pt-1.5 text-[10px] text-amber-300 font-mono">
                  {engine.retrieval_friction_points[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Structured Content Chunking Recommendations */}
      <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Recommended Vector Chunking Architecture</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              512-token semantic blocks formatted with contextual headers to eliminate embedding drift.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
            {generative_snippets.structured_chunk_recommendations.length} Chunks Generated
          </span>
        </div>

        <div className="space-y-3">
          {generative_snippets.structured_chunk_recommendations.map((chunk) => (
            <div
              key={chunk.chunk_index}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300">
                    Chunk #{chunk.chunk_index}
                  </span>
                  <span className="text-xs font-semibold text-cyan-300 font-mono">
                    {chunk.heading_context}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                  <span>~{chunk.token_count} tokens</span>
                  <span className="text-emerald-400 font-bold">{chunk.semantic_density_score}% density</span>
                </div>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed bg-[#06070a] p-3 rounded-lg border border-white/[0.04]">
                {chunk.chunk_text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Priority Actionable Remediation Checklist */}
      <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              AIO Priority Remediation Checklist
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {rag_readiness.priority_remediations.length} high-impact steps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rag_readiness.priority_remediations.map((item, idx) => (
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
                title="Copy action"
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
    </div>
  );
};
