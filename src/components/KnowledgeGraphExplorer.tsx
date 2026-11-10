"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Cpu,
  Layers,
  Sparkles,
  Code2,
  Table as TableIcon,
  Download,
  Info,
  CheckCircle2,
  Compass
} from "lucide-react";
import { EntityGraphData } from "@/types/aio";

interface KnowledgeGraphExplorerProps {
  entityGraph: EntityGraphData;
  targetEntity: string;
  schemaJsonld: Record<string, any>;
  formattedSchemaTag: string;
}

export const KnowledgeGraphExplorer: React.FC<KnowledgeGraphExplorerProps> = ({
  entityGraph,
  targetEntity,
  schemaJsonld,
  formattedSchemaTag
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string>(targetEntity);
  const [viewMode, setViewMode] = useState<"visual-graph" | "triples-table" | "jsonld-code">("visual-graph");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadJsonLd = () => {
    const blob = new Blob([JSON.stringify(schemaJsonld, null, 2)], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${targetEntity.toLowerCase().replace(/[^a-z0-9]/g, "-")}-schema-graph.jsonld`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Downloaded Schema.org JSON-LD graph");
  };

  // Node coordinates on a radial layout around the center node (cx: 300, cy: 190)
  const cx = 300;
  const cy = 190;
  const coEntities = entityGraph.co_occurring_entities.slice(0, 6);
  const nodeCount = Math.max(1, coEntities.length);
  const radius = 130;

  const nodes = coEntities.map((name, idx) => {
    const angle = (idx / nodeCount) * 2 * Math.PI - Math.PI / 2;
    const nx = Math.round(cx + radius * Math.cos(angle));
    const ny = Math.round(cy + radius * Math.sin(angle));
    return {
      name,
      x: nx,
      y: ny,
      wikidataUrl: entityGraph.wikidata_links[name]
    };
  });

  const selectedWiki = entityGraph.wikidata_links[selectedEntity];

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#090b10] border border-white/[0.08]">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-indigo-400" />
            <span>Interactive Knowledge Graph & Wikidata Grounding Explorer</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Eliminates LLM hallucination by linking unstructured text to persistent Wikidata URIs and Schema.org @graph nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setViewMode("visual-graph")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "visual-graph"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Visual Graph
            </button>
            <button
              onClick={() => setViewMode("triples-table")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "triples-table"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Triples Table ({entityGraph.triples.length})
            </button>
            <button
              onClick={() => setViewMode("jsonld-code")}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === "jsonld-code"
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              JSON-LD Code
            </button>
          </div>

          <button
            onClick={downloadJsonLd}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Graph</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL GRAPH VIEW */}
      {viewMode === "visual-graph" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SVG Canvas */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#06070a] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                <span>Radial Conceptual Node-Link Projection</span>
              </span>
              <span className="text-slate-500">Click any node to inspect Wikidata triples</span>
            </div>

            <div className="relative w-full max-w-[600px] aspect-[600/380] select-none">
              <svg viewBox="0 0 600 380" className="w-full h-full">
                <defs>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Connecting Edges */}
                {nodes.map((node, i) => (
                  <g key={`edge-${i}`}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={node.x}
                      y2={node.y}
                      stroke="url(#edgeGrad)"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="transition-all"
                    />
                    {/* Edge Midpoint Label */}
                    <circle
                      cx={(cx + node.x) / 2}
                      cy={(cy + node.y) / 2}
                      r="4"
                      fill="#6366f1"
                      className="animate-pulse"
                    />
                  </g>
                ))}

                {/* Satellite Co-Occurring Nodes */}
                {nodes.map((node, i) => {
                  const isSelected = selectedEntity === node.name;
                  return (
                    <g
                      key={`node-${i}`}
                      onClick={() => setSelectedEntity(node.name)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? "26" : "22"}
                        fill={isSelected ? "#1e1b4b" : "#0d1117"}
                        stroke={isSelected ? "#818cf8" : "#374151"}
                        strokeWidth={isSelected ? "3" : "1.5"}
                        filter={isSelected ? "url(#glow)" : undefined}
                        className="transition-all duration-200 group-hover:stroke-indigo-400 group-hover:scale-105"
                      />
                      <text
                        x={node.x}
                        y={node.y + 36}
                        textAnchor="middle"
                        fill={isSelected ? "#c7d2fe" : "#94a3b8"}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight={isSelected ? "bold" : "normal"}
                        className="pointer-events-none"
                      >
                        {node.name.length > 16 ? node.name.slice(0, 14) + "..." : node.name}
                      </text>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="6"
                        fill={node.wikidataUrl ? "#34d399" : "#64748b"}
                      />
                    </g>
                  );
                })}

                {/* Central Primary Entity Node */}
                <g
                  onClick={() => setSelectedEntity(targetEntity)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="40"
                    fill="#0f172a"
                    stroke="#22d3ee"
                    strokeWidth="3.5"
                    filter="url(#glow)"
                    className="transition-all hover:scale-105"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r="48"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="animate-spin origin-center"
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    PRIMARY
                  </text>
                  <text
                    x={cx}
                    y={cy + 60}
                    textAnchor="middle"
                    fill="#22d3ee"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {targetEntity.length > 22 ? targetEntity.slice(0, 20) + "..." : targetEntity}
                  </text>
                </g>
              </svg>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 mt-3 pt-3 border-t border-white/[0.04]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Primary Salient Node</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Wikidata Grounded</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Knowledge Triple Edge</span>
              </span>
            </div>
          </div>

          {/* Node Inspector Card */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="h-4 w-4" />
                <h4 className="text-xs font-bold font-mono uppercase">Node Inspector</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300">
                {selectedEntity === targetEntity ? "Root Entity" : "Co-Occurring"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500">Selected Entity</span>
              <h3 className="text-base font-bold text-white font-mono break-words">{selectedEntity}</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500">Wikidata URI Grounding</span>
              {selectedWiki ? (
                <div className="space-y-1">
                  <a
                    href={selectedWiki}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-300 hover:underline flex items-center gap-1.5 break-all"
                  >
                    <span>{selectedWiki}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Machine Verified Entity Anchor</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-mono">
                  No automated Wikidata URI mapping found. Recommend linking manually via Schema.org <code className="text-cyan-300">sameAs</code>.
                </p>
              )}
            </div>

            {/* Triples referencing this entity */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500">Associated Triples</span>
              <div className="space-y-1.5">
                {entityGraph.triples
                  .filter((t) => t.subject === selectedEntity || t.object === selectedEntity || selectedEntity === targetEntity)
                  .slice(0, 3)
                  .map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#050608] border border-white/[0.04] text-[11px] font-mono space-y-0.5"
                    >
                      <div className="text-cyan-300 font-bold">{t.subject}</div>
                      <div className="text-indigo-400 font-semibold pl-2">↳ {t.predicate}</div>
                      <div className="text-slate-300 pl-4">{t.object}</div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(selectedWiki || selectedEntity, "node-copy", "Entity metadata")}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-medium transition flex items-center justify-center gap-2"
            >
              {copiedKey === "node-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Entity URI</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TRIPLES TABLE VIEW */}
      {viewMode === "triples-table" && (
        <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-cyan-400" />
                <span>Knowledge Graph Semantic Triples</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured subject-predicate-object statements ingested by LLMs during graph-RAG retrieval.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(entityGraph.triples, null, 2), "triples-copy", "Triples JSON")}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
            >
              {copiedKey === "triples-copy" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>Copy Triples</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Predicate</th>
                  <th className="py-3 px-4">Object / Concept</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {entityGraph.triples.map((t, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 text-cyan-300 font-bold">{t.subject}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{t.predicate}</td>
                    <td className="py-3 px-4 text-slate-200">{t.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. JSON-LD CODE VIEW */}
      {viewMode === "jsonld-code" && (
        <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Interconnected Schema.org JSON-LD @graph</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Embed this exact script tag into your webpage &lt;head&gt; to ground your content into LLM knowledge bases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(formattedSchemaTag, "schema-tag", "Schema script tag")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition flex items-center gap-1.5"
              >
                {copiedKey === "schema-tag" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Script Tag</span>
              </button>
              <button
                onClick={downloadJsonLd}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download JSON-LD</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#050608] overflow-hidden">
            <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-500 ml-2">application/ld+json</span>
              </div>
              <span>{JSON.stringify(schemaJsonld).length} bytes</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[460px] leading-relaxed selection:bg-cyan-500 selection:text-black">
              {JSON.stringify(schemaJsonld, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
