/**
 * seo.ts: TypeScript Type Definitions for AiSeo Platform
 * Matching FastAPI backend Pydantic contracts.
 */

export interface AnalysisRequest {
  url: string;
  target_entity?: string;
  timeout_seconds?: number;
}

export interface HeadingItem {
  level: string;
  text: string;
  is_question: boolean;
}

export interface TableRecord {
  headers: string[];
  rows: string[][];
  markdown_representation: string;
}

export interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  metrics: Record<string, any>;
  recommendations: string[];
}

export interface CitationPrediction {
  tier: "High" | "Medium" | "Low" | "Unlikely";
  primary_citation_probability: number;
  top_strengths: string[];
  critical_vulnerabilities: string[];
}

export interface AIQualitativeInsight {
  executive_assessment: string;
  missing_latent_entities: string[];
  suggested_bluf_hook: string;
  provider_used: string;
}

export interface GeoScore {
  overall_score: number;
  grade: "A+" | "A" | "B" | "C" | "F";
  citation_prediction: CitationPrediction;
  dimensions: {
    bluf: DimensionScore;
    density: DimensionScore;
    entity: DimensionScore;
    structure: DimensionScore;
    schema: DimensionScore;
  };
  actionable_checklist: string[];
  ai_enhanced: boolean;
  ai_insight?: AIQualitativeInsight;
}

export interface GroundedEntity {
  name: string;
  wikidata_url: string;
  relevance_type: "about" | "mentions";
}

export interface SchemaRecommendations {
  schema_type: string;
  jsonld_payload: Record<string, any>;
  formatted_script_tag: string;
  entities_grounded: GroundedEntity[];
  faq_count: number;
}

export interface TransformedSection {
  heading: string;
  content: string;
  is_table: boolean;
}

export interface RAGTransformation {
  bluf_paragraph: string;
  restructured_markdown: string;
  sections: TransformedSection[];
  llms_txt_snippet: string;
  anaphora_replacements_count: number;
}

export interface QuerySimulationMetric {
  query: string;
  intent_type: string;
  target_cited: boolean;
  citation_rank?: number | null;
  rank_position_score: number;
  attributed_token_share: number;
  survived_cross_encoder: boolean;
  simulated_answer_snippet: string;
}

export interface EngineCitationBreakdown {
  engine_name: string;
  estimated_inclusion_rate: number;
  primary_citation_rate: number;
  risk_factors: string[];
}

export interface SimulationResult {
  target_url: string;
  target_entity: string;
  total_queries_simulated: number;
  citation_success_rate: number;
  mean_rank_position_score: number;
  average_token_share: number;
  query_details: QuerySimulationMetric[];
  engine_breakdown: EngineCitationBreakdown[];
  simulation_summary: string;
}

export interface CrawlerConfigsResponse {
  robots_txt: string;
  llms_txt: string;
  llms_full_txt: string;
  recommended_edge_rules: string[];
}

export interface FullAnalysisResponse {
  request_url: string;
  target_entity: string;
  scraped_summary: {
    title: string;
    meta_description: string;
    canonical_url: string;
    word_count: number;
    reading_time_minutes: number;
    h1_count: number;
    h2_count: number;
    table_count: number;
    content_to_html_ratio: number;
  };
  geo_score: GeoScore;
  schema_recommendations: SchemaRecommendations;
  transformation: RAGTransformation;
  simulation: SimulationResult;
  crawler_configs: CrawlerConfigsResponse;
  analyzed_at: string;
}
