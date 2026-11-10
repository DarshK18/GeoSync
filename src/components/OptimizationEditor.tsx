"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Split,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  Table as TableIcon,
  Download
} from "lucide-react";
import { GenerativeSnippetRecommendations } from "@/types/aio";

interface OptimizationEditorProps {
  snippets: GenerativeSnippetRecommendations;
  targetEntity: string;
}

export const OptimizationEditor: React.FC<OptimizationEditorProps> = ({
  snippets,
  targetEntity
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"side-by-side" | "diff-stacked">("side-by-side");

  const copyToClipboard = (text: string, key: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadRewritten = () => {
    const blob = new Blob([snippets.rewritten_optimized_text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${targetEntity.toLowerCase().replace(/[^a-z0-9]/g, "-")}-rag-optimized.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Downloaded optimized Markdown file");
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#090b10] border border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Split className="h-4 w-4 text-indigo-400" />
            <span>AIO Content Transformation & Side-by-Side Diff</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares original unstructured prose against the high-density inverted pyramid architecture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "side-by-side"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("diff-stacked")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "diff-stacked"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Stacked View
            </button>
          </div>

          <button
            onClick={downloadRewritten}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* BLUF Highlight Callout */}
      <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold font-mono uppercase tracking-wider">
              Recommended 50-Word BLUF (Bottom Line Up Front)
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(snippets.recommended_bluf_opening, "bluf-open", "BLUF paragraph")}
            className="text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1"
          >
            {copiedKey === "bluf-open" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>Copy BLUF</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed bg-[#050608] p-3.5 rounded-xl border border-cyan-500/20">
          {snippets.recommended_bluf_opening}
        </p>
        <p className="text-[11px] text-slate-400 font-mono">
          Inject this paragraph directly beneath your primary &lt;h1&gt; tag. Eliminates conversational preamble and guarantees zero-shot context extraction by Perplexity and Google AI Overviews.
        </p>
      </div>

      {/* Side-by-Side or Stacked Diff Columns */}
      <div className={viewMode === "side-by-side" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}>
        {/* Left Column: Original Scraped Text */}
        <div className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Original Scraped Text</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Low Information Gain
              </span>
            </div>

            <div className="bg-[#050608] p-4 rounded-xl border border-white/[0.04] text-xs font-mono text-slate-400 leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap select-all">
              {snippets.original_text_sample}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] text-[11px] text-rose-400/80 font-mono flex items-center gap-1.5">
            <span>⚠️ Prone to embedding dilution and pronoun anaphora drift.</span>
          </div>
        </div>

        {/* Right Column: AI-Recommended Rewritten Text */}
        <div className="p-5 rounded-2xl bg-[#090b10] border border-cyan-500/30 shadow-lg shadow-cyan-500/5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-xs font-mono uppercase text-cyan-300 font-bold">RAG-Optimized Rewrite</span>
              </div>
              <button
                onClick={() => copyToClipboard(snippets.rewritten_optimized_text, "rewrite-copy", "Rewritten Markdown")}
                className="px-2.5 py-1 rounded text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1"
              >
                {copiedKey === "rewrite-copy" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>Copy Full Markdown</span>
              </button>
            </div>

            <div className="bg-[#050608] p-4 rounded-xl border border-cyan-500/20 text-xs font-mono text-slate-200 leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500 selection:text-black">
              {snippets.rewritten_optimized_text}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Validated for direct vector retrieval and Top-1 primary anchor citation.</span>
          </div>
        </div>
      </div>

      {/* Pronoun Anaphora Disambiguation Table */}
      {snippets.anaphora_replacements.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Resolved Pronoun Anaphora Disambiguations</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {snippets.anaphora_replacements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-mono flex items-center gap-3"
              >
                <span className="text-rose-400 line-through truncate max-w-[140px]">
                  {item.original}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-emerald-400 font-bold truncate">
                  {item.fixed}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
