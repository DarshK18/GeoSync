"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AioScanner } from "@/components/AioScanner";
import { GeoMetrics } from "@/components/GeoMetrics";
import { OptimizationEditor } from "@/components/OptimizationEditor";
import { KnowledgeGraphExplorer } from "@/components/KnowledgeGraphExplorer";
import { ScoreImprovementPlan } from "@/components/ScoreImprovementPlan";
import { PipelineInspector } from "@/components/PipelineInspector";
import { analyzeGeo } from "@/lib/api";
import { GeoAnalysisRequest, GeoAnalysisResponse } from "@/types/aio";
import {
  Cpu,
  Database,
  Terminal,
  AlertCircle,
  Sparkles,
  Layers,
  Split,
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  Bot,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";

type ActiveTabType = "metrics" | "knowledge-graph" | "improvement-plan" | "pipeline" | "editor" | "crawlers";

export default function Home() {
  const [reportData, setReportData] = useState<GeoAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>("metrics");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize with Header Navigation Bar
  useEffect(() => {
    const handleTabSelect = (e: any) => {
      const selected = e.detail;
      if (!selected) return;

      if (selected === "knowledge-graph") {
        setActiveTab("knowledge-graph");
      } else if (selected === "pipeline") {
        setActiveTab("pipeline");
      } else if (selected === "direct-answer" || selected === "entity-saturation" || selected === "information-gain") {
        setActiveTab("metrics");
      } else if (selected === "improvement-plan") {
        setActiveTab("improvement-plan");
      }

      // If user clicks a top bar item when no report exists, notify them or auto-run sample
      if (!reportData && !isLoading) {
        toast.info(`Please enter a URL or click "Audit & Generate AIO Plan" below to evaluate ${selected.replace("-", " ")}.`);
      }
    };

    window.addEventListener("aio-tab-select", handleTabSelect);
    return () => window.removeEventListener("aio-tab-select", handleTabSelect);
  }, [reportData, isLoading]);

  const handleAnalyze = async (request: GeoAnalysisRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    const toastId = toast.loading("Executing LangGraph AIO Evaluation Pipeline...");

    try {
      const response = await analyzeGeo(request);
      setReportData(response);
      toast.success(
        `AIO Audit Complete! RRI Score: ${Math.round(response.rag_readiness.overall_score)}/100 (${response.rag_readiness.letter_grade})`,
        { id: toastId }
      );
    } catch (err: any) {
      const msg = err.message || "Failed to execute AIO pipeline.";
      setErrorMessage(msg);
      toast.error(`AIO Audit Failed: ${msg}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-4 max-w-4xl mx-auto pt-2"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-300 shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span>AIO & GEO • Enterprise Artificial Intelligence Optimization</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Dominate LLM Citations.{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Survive RAG Retrieval.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Legacy SEO metrics (keywords, backlinks) are obsolete in the age of generative search.
          AIO evaluates Direct Answer Density, Semantic Entity Saturation, and Information Gain for Gemini, ChatGPT, Claude, and Perplexity.
        </p>

        {/* Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
          <button
            onClick={() => {
              setActiveTab("pipeline");
              window.dispatchEvent(new CustomEvent("aio-tab-select", { detail: "pipeline" }));
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center gap-1.5 shadow-sm transition"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>LangGraph RAG Pipeline</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("knowledge-graph");
              window.dispatchEvent(new CustomEvent("aio-tab-select", { detail: "knowledge-graph" }));
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center gap-1.5 shadow-sm transition"
          >
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>Wikidata Knowledge Graph</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("improvement-plan");
              window.dispatchEvent(new CustomEvent("aio-tab-select", { detail: "improvement-plan" }));
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center gap-1.5 shadow-sm transition"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Score Improvement Roadmap</span>
          </button>
        </div>
      </motion.div>

      {/* Main AIO Scanner Input */}
      <AioScanner onAnalyze={handleAnalyze} isLoading={isLoading} />

      {/* Error Alert */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-3"
        >
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Execution Error: </span>
            <span>{errorMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Results Dashboard */}
      {reportData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-6xl mx-auto space-y-6"
        >
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-3 gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              {/* Tab 1: Metrics */}
              <button
                onClick={() => setActiveTab("metrics")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  activeTab === "metrics"
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span>RAG Readiness & 3D Matrix</span>
              </button>

              {/* Tab 2: Knowledge Graph (Resolving user issue: Knowledge Graph bar dont work) */}
              <button
                onClick={() => setActiveTab("knowledge-graph")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  activeTab === "knowledge-graph"
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                <span>Knowledge Graph Explorer</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {Object.keys(reportData.entity_graph.wikidata_links).length} Grounded
                </span>
              </button>

              {/* Tab 3: Score Improvement Plan */}
              <button
                onClick={() => setActiveTab("improvement-plan")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  activeTab === "improvement-plan"
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Score Improvement Roadmap</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +{Math.round(reportData.improvement_plan.projected_score - reportData.improvement_plan.current_score)} pts
                </span>
              </button>

              {/* Tab 4: LangGraph Pipeline */}
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  activeTab === "pipeline"
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>LangGraph Pipeline</span>
              </button>

              {/* Tab 5: Optimization Diff Editor */}
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
                  activeTab === "editor"
                    ? "bg-white/[0.08] text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Split className="h-3.5 w-3.5 text-indigo-400" />
                <span>Optimization Diff</span>
              </button>

              {/* Tab 6: AI Crawlers */}
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

            {/* Target Entity Badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-500">Target Entity:</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                {reportData.target_entity}
              </span>
            </div>
          </div>

          {/* TAB 1: GEO METRICS */}
          {activeTab === "metrics" && <GeoMetrics data={reportData} />}

          {/* TAB 2: KNOWLEDGE GRAPH EXPLORER */}
          {activeTab === "knowledge-graph" && (
            <KnowledgeGraphExplorer
              entityGraph={reportData.entity_graph}
              targetEntity={reportData.target_entity}
              schemaJsonld={reportData.schema_jsonld}
              formattedSchemaTag={reportData.formatted_schema_tag}
            />
          )}

          {/* TAB 3: SCORE IMPROVEMENT ROADMAP & SIMULATOR */}
          {activeTab === "improvement-plan" && (
            <ScoreImprovementPlan
              plan={reportData.improvement_plan}
              targetEntity={reportData.target_entity}
            />
          )}

          {/* TAB 4: LANGGRAPH PIPELINE INSPECTOR */}
          {activeTab === "pipeline" && (
            <PipelineInspector
              metrics={reportData.pipeline_metrics}
              targetEntity={reportData.target_entity}
            />
          )}

          {/* TAB 5: OPTIMIZATION DIFF EDITOR */}
          {activeTab === "editor" && (
            <OptimizationEditor
              snippets={reportData.generative_snippets}
              targetEntity={reportData.target_entity}
            />
          )}

          {/* TAB 6: AI CRAWLER DIRECTIVES */}
          {activeTab === "crawlers" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">AI-Optimized robots.txt</h3>
                  <button
                    onClick={() => copyToClipboard(reportData.crawler_directives.robots_txt, "rob-copy", "robots.txt")}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
                  >
                    {copiedKey === "rob-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#050608] border border-white/[0.04] text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                  {reportData.crawler_directives.robots_txt}
                </pre>
              </div>

              <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Context Standard: /llms.txt</h3>
                  <button
                    onClick={() => copyToClipboard(reportData.crawler_directives.llms_txt, "llm-copy", "llms.txt")}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition"
                  >
                    {copiedKey === "llm-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#050608] border border-white/[0.04] text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                  {reportData.crawler_directives.llms_txt}
                </pre>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Explanatory Pillars when idle */}
      {!reportData && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="max-w-5xl mx-auto pt-8 border-t border-white/[0.06] space-y-6"
        >
          <div className="text-center space-y-1">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">
              The Three Pillars of Artificial Intelligence Optimization (AIO)
            </h3>
            <p className="text-sm text-slate-300 font-semibold">
              Designed for LLM Context Retention and Primary Citation Anchors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Direct Answer Density</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Core factual answers must appear in the first 50 words with declarative copula syntax. Conversational fluff triggers early cross-encoder pruning.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Semantic Entity Saturation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Concepts are tightly clustered into 512-token chunks with resolved pronoun anaphora, preventing embedding dilution during dense vector matching.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#090b10] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Information Gain</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Content must provide empirical data tables, percentages, and benchmark figures that prevent LLMs from treating it as a generic aggregator.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
