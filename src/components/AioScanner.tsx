"use client";

import React, { useState, useEffect } from "react";
import { Search, Globe, Tag, ArrowRight, Loader2, Sparkles, Command, Cpu, Layers } from "lucide-react";
import { GeoAnalysisRequest } from "@/types/aio";

interface AioScannerProps {
  onAnalyze: (request: GeoAnalysisRequest) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: "RAG Architecture",
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
  },
  {
    name: "LangChain Framework",
    url: "https://en.wikipedia.org/wiki/LangChain",
    entity: "LangChain"
  }
];

const SCANNER_STAGES = [
  "Connecting to target host via HTTPX async client...",
  "Extracting clean DOM & measuring Direct Answer Density...",
  "Running LangGraph RAG Evaluation & Entity Saturation...",
  "Querying Wikidata Knowledge Graph & building entity triples...",
  "Synthesizing LLM-optimized BLUF paragraph & vector chunks...",
  "Compiling interconnected Schema.org @graph JSON-LD..."
];

export const AioScanner: React.FC<AioScannerProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState("https://en.wikipedia.org/wiki/Retrieval-augmented_generation");
  const [targetEntity, setTargetEntity] = useState("Retrieval-Augmented Generation");
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStageIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev < SCANNER_STAGES.length - 1 ? prev + 1 : prev));
    }, 900);
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
      <div className="rounded-2xl p-6 sm:p-8 bg-[#090b10] border border-white/[0.08] shadow-2xl relative transition-all overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header line */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              AIO Scanner • LangGraph RAG Evaluation
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <Command className="h-3 w-3" />
            <span>Enter to launch pipeline</span>
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
                  placeholder="https://yourdomain.com/technical-guide"
                  className="w-full pl-3.5 pr-9 py-3 rounded-xl bg-[#06070a] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition font-mono disabled:opacity-50"
                />
                <div className="absolute right-3 top-3.5 text-slate-500 pointer-events-none">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Entity Topic
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder="e.g. Acme DB"
                className="w-full px-3.5 py-3 rounded-xl bg-[#06070a] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Presets:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 border border-white/[0.06] hover:border-white/[0.12] transition disabled:opacity-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Running LangGraph Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Audit & Generate AIO Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Step-by-step loading telemetry */}
        {isLoading && (
          <div className="mt-5 p-4 rounded-xl bg-[#06070b] border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-cyan-400 animate-spin flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-mono text-cyan-300 font-medium">
                  {SCANNER_STAGES[stageIdx]}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((stageIdx + 1) / SCANNER_STAGES.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Stage {stageIdx + 1} of {SCANNER_STAGES.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
