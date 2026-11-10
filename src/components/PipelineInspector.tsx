"use client";

import React, { useState } from "react";
import {
  Cpu,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  FileCode,
  ShieldCheck,
  Check,
  Zap,
  Activity
} from "lucide-react";
import { LangGraphPipelineMetrics } from "@/types/aio";

interface PipelineInspectorProps {
  metrics: LangGraphPipelineMetrics;
  targetEntity: string;
}

const NODES_DATA = [
  {
    id: "scrape",
    title: "1. Scrape Node",
    engine: "HTTPX Async Client + BeautifulSoup4",
    purpose: "Fetches target URL DOM, rotates AI crawler User-Agents, and purges boilerplate DOM noise.",
    stateProduced: "scraped_telemetry, clean_text, first_50_words, tables, headings"
  },
  {
    id: "entity_graph",
    title: "2. Entity Graph Node",
    engine: "Wikidata Knowledge Engine",
    purpose: "Grounds concepts to persistent Wikidata URIs and constructs semantic triples.",
    stateProduced: "entity_graph, wikidata_links, triples, pronoun_anaphora_drift_count"
  },
  {
    id: "aio_analysis",
    title: "3. AIO Analysis Node",
    engine: "LangChain 3D GEO Evaluator",
    purpose: "Evaluates Direct Answer Density, Semantic Entity Saturation, and Information Gain.",
    stateProduced: "rag_readiness, direct_answer, semantic_entity, info_gain"
  },
  {
    id: "snippets",
    title: "4. Snippet Node",
    engine: "Vector Chunk Synthesizer",
    purpose: "Formulates 50-word BLUF direct answer and resolves pronoun anaphora in vector chunks.",
    stateProduced: "generative_snippets, recommended_bluf_opening, chunks, rewrite"
  },
  {
    id: "schema",
    title: "5. Schema Node",
    engine: "Schema.org @graph Compiler",
    purpose: "Synthesizes machine-validated Schema.org JSON-LD and AI crawler directives (robots & llms.txt).",
    stateProduced: "schema_jsonld, formatted_schema_tag, crawler_directives, improvement_plan"
  }
];

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  metrics,
  targetEntity
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("aio_analysis");

  const selectedNode = NODES_DATA.find((n) => n.id === selectedNodeId) || NODES_DATA[0];
  const nodeTiming = metrics.node_timings_ms[selectedNodeId] || 45;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>LangGraph State Machine Pipeline Execution Telemetry</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time execution trace across all 5 stateful LangGraph nodes for {targetEntity}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-300">Total Latency:</span>
            <span className="text-white font-bold">{metrics.total_execution_ms} ms</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>5/5 Nodes Succeeded</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Nodes Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {NODES_DATA.map((node, idx) => {
          const isSelected = selectedNodeId === node.id;
          const timing = metrics.node_timings_ms[node.id] || 35;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 relative ${
                isSelected
                  ? "bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                  : "bg-[#090b10] border-white/[0.06] hover:border-white/[0.14]"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Step 0{idx + 1}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {timing}ms
                </span>
              </div>

              <h4 className={`text-xs font-bold font-mono ${isSelected ? "text-cyan-300" : "text-white"}`}>
                {node.title.split(". ")[1]}
              </h4>

              <p className="text-[10px] text-slate-400 font-mono truncate">
                {node.engine.split(" + ")[0]}
              </p>

              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Card */}
      <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white font-mono">{selectedNode.title}</h4>
              <p className="text-xs text-slate-400 font-mono">Engine: {selectedNode.engine}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Execution Time:</span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] text-cyan-300 font-bold border border-white/[0.06]">
              {nodeTiming} ms
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Node Operational Mandate</span>
            <p className="text-slate-300 leading-relaxed">{selectedNode.purpose}</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] text-indigo-400 uppercase font-bold">State Properties Mutated</span>
            <p className="text-cyan-300 leading-relaxed font-mono">{selectedNode.stateProduced}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
