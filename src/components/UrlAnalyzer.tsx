"use client";

import React, { useState } from "react";
import { Search, Globe, Tag, ArrowRight, Loader2, Sparkles, Command } from "lucide-react";
import { AnalysisRequest } from "@/types/seo";

interface UrlAnalyzerProps {
  onAnalyze: (request: AnalysisRequest) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: "RAG Systems",
    url: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
    entity: "Retrieval-Augmented Generation"
  },
  {
    name: "Vector Databases",
    url: "https://en.wikipedia.org/wiki/Vector_database",
    entity: "Vector Database"
  },
  {
    name: "Large Language Models",
    url: "https://en.wikipedia.org/wiki/Large_language_model",
    entity: "Large Language Model"
  }
];

const AUDIT_STAGES = [
  "Connecting to target host via HTTPX async client...",
  "Purging DOM boilerplate & calculating token density ratio...",
  "Auditing BLUF opening & measuring pronoun anaphora drift...",
  "Querying Wikidata knowledge graph & constructing Schema.org...",
  "Simulating cross-encoder rerankers & citation placement..."
];

export const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState("https://en.wikipedia.org/wiki/Retrieval-augmented_generation");
  const [targetEntity, setTargetEntity] = useState("Retrieval-Augmented Generation");
  const [stageIdx, setStageIdx] = useState(0);

  React.useEffect(() => {
    if (!isLoading) {
      setStageIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev < AUDIT_STAGES.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAnalyze({
      url: url.trim(),
      target_entity: targetEntity.trim() || undefined
    });
  };

  const handleSelectPreset = (p: typeof PRESETS[0]) => {
    setUrl(p.url);
    setTargetEntity(p.entity);
    onAnalyze({
      url: p.url,
      target_entity: p.entity
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="typesafe-card rounded-2xl p-6 sm:p-7 relative transition-all">
        {/* Header line */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Target Ingestion & Cross-Encoder Audit
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <Command className="h-3 w-3" />
            <span>Enter to run</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Target Webpage URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  disabled={isLoading}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com/blog/technical-guide"
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-[#0b0d13] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition font-mono disabled:opacity-50"
                />
                <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Brand / Primary Entity
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="e.g. Acme DB"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0d13] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.04]">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Presets:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] hover:border-white/[0.12] transition disabled:opacity-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Evaluating RAG Retrieval...</span>
                </>
              ) : (
                <>
                  <span>Audit & Generate Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Status Telemetry during Audit */}
        {isLoading && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#0b0e14] border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-cyan-400 animate-spin flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-mono text-cyan-300 font-medium">
                  {AUDIT_STAGES[stageIdx]}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Stage {stageIdx + 1} of {AUDIT_STAGES.length} • Reverse-engineering cross-encoder attention weights
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
