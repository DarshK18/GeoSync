/**
 * aio.ts: Strict TypeScript Interfaces for AIO & GEO Platform
 * Mirrors Pydantic models from api/schemas/aio_models.py
 * Legacy SEO concepts (keywords, backlinks) are strictly omitted.
 */

export interface GeoAnalysisRequest {
  url: string;
  target_entity?: string;
  timeout_seconds?: number;
}

export interface DimensionBreakdown {
  name: string;
  score: number;
  weight: number;
  status: "Optimal" | "Needs Optimization" | "Critical Risk";
  diagnosis: string;
  recommendations: string[];
}

export interface RagReadinessScore {
  overall_score: number;
  citation_probability_score: number;
  direct_answer_density_score: number;
  semantic_entity_saturation_score: number;
  information_gain_score: number;
  tier: "Exceptional" | "High" | "Moderate" | "Critical Risk";
  letter_grade: "A+" | "A" | "B" | "C" | "F";
  dimensions: {
    direct_answer_density: DimensionBreakdown;
    semantic_entity_saturation: DimensionBreakdown;
    information_gain: DimensionBreakdown;
  };
  critical_issues: string[];
  priority_remediations: string[];
}

export interface KnowledgeTriple {
  subject: string;
  predicate: string;
  object: string;
}

export interface EntityGraphData {
  primary_entity: string;
  salience_score: number;
  co_occurring_entities: string[];
  wikidata_links: Record<string, string>;
  triples: KnowledgeTriple[];
  pronoun_anaphora_drift_count: number;
}

export interface EnginePrediction {
  engine_name: string;
  inclusion_probability: number;
  primary_anchor_probability: number;
  retrieval_friction_points: string[];
}

export interface ContentChunk {
  chunk_index: number;
  heading_context: string;
  token_count: number;
  semantic_density_score: number;
  chunk_text: string;
}

export interface GenerativeSnippetRecommendations {
  recommended_bluf_opening: string;
  per_engine_predictions: EnginePrediction[];
  structured_chunk_recommendations: ContentChunk[];
  original_text_sample: string;
  rewritten_optimized_text: string;
  anaphora_replacements: Array<{ original: string; fixed: string }>;
}

export interface ScrapedTelemetry {
  title: string;
  meta_description: string;
  canonical_url?: string;
  word_count: number;
  reading_time_minutes: number;
  h1_count: number;
  h2_count: number;
  table_count: number;
  data_points_count: number;
  content_to_html_ratio: number;
}

export interface ActionItem {
  category: "Direct Answer Density" | "Entity Saturation" | "Information Gain" | "Knowledge Graph" | "LangGraph Pipeline";
  title: string;
  impact_points: number;
  priority: "Critical" | "High" | "Medium";
  current_gap: string;
  exact_remediation: string;
  copyable_template: string;
}

export interface ScoreImprovementPlan {
  current_score: number;
  current_grade: string;
  projected_score: number;
  projected_grade: string;
  projected_citation_gain_pct: number;
  dimension_potential: Record<string, number>;
  actions: ActionItem[];
}

export interface LangGraphPipelineMetrics {
  total_execution_ms: number;
  nodes_executed: string[];
  node_timings_ms: Record<string, number>;
  state_transitions_count: number;
  retrieval_status: string;
}

export interface GeoAnalysisResponse {
  request_url: string;
  target_entity: string;
  scraped_telemetry: ScrapedTelemetry;
  rag_readiness: RagReadinessScore;
  entity_graph: EntityGraphData;
  generative_snippets: GenerativeSnippetRecommendations;
  schema_jsonld: Record<string, any>;
  formatted_schema_tag: string;
  crawler_directives: {
    robots_txt: string;
    llms_txt: string;
  };
  improvement_plan: ScoreImprovementPlan;
  pipeline_metrics: LangGraphPipelineMetrics;
  analyzed_at: string;
}
