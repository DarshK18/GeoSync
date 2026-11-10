"""
aio_models.py: Strict Pydantic Models for AIO & GEO Platform API Contracts
Defines data contracts for RAG-readiness scoring, entity graph data,
generative snippet recommendations, score improvement plans, and LangGraph metrics.
Legacy SEO fields (keywords, backlinks) are strictly omitted.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GeoAnalysisRequest(BaseModel):
    url: str = Field(
        ...,
        description="Target webpage URL to audit and rewrite for LLM citation and RAG retrieval.",
        example="https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
    )
    target_entity: Optional[str] = Field(
        None,
        description="Primary brand or entity topic to ground into knowledge graphs and vector clusters.",
        example="Retrieval-Augmented Generation"
    )
    timeout_seconds: Optional[int] = Field(
        15,
        ge=5,
        le=60,
        description="Scraping timeout in seconds tailored for serverless limits."
    )


class DimensionBreakdown(BaseModel):
    name: str = Field(..., description="Name of the evaluated AIO dimension.")
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score 0-100.")
    weight: float = Field(..., description="Weight of this dimension in composite RAG-readiness.")
    status: str = Field(..., description="'Optimal', 'Needs Optimization', or 'Critical Risk'.")
    diagnosis: str = Field(..., description="Technical diagnosis of the passage structure.")
    recommendations: List[str] = Field(default_factory=list, description="Immediate actionable steps.")


class RagReadinessScore(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Composite RAG-Readiness Index (RRI).")
    citation_probability_score: float = Field(..., ge=0.0, le=100.0, description="Predicted probability of securing primary [1] citation.")
    direct_answer_density_score: float = Field(..., ge=0.0, le=100.0, description="Score based on core factual answers in first 50 words.")
    semantic_entity_saturation_score: float = Field(..., ge=0.0, le=100.0, description="Clustering density of salient conceptual entities.")
    information_gain_score: float = Field(..., ge=0.0, le=100.0, description="Uniqueness score from data tables, stats, and non-generic content.")
    tier: str = Field(..., description="'Exceptional', 'High', 'Moderate', or 'Critical Risk'.")
    letter_grade: str = Field(..., description="'A+', 'A', 'B', 'C', or 'F'.")
    dimensions: Dict[str, DimensionBreakdown] = Field(default_factory=dict)
    critical_issues: List[str] = Field(default_factory=list)
    priority_remediations: List[str] = Field(default_factory=list)


class KnowledgeTriple(BaseModel):
    subject: str = Field(..., description="Entity subject.")
    predicate: str = Field(..., description="Semantic relationship predicate.")
    object: str = Field(..., description="Entity object or attribute.")


class EntityGraphData(BaseModel):
    primary_entity: str = Field(..., description="Identified core entity topic.")
    salience_score: float = Field(..., ge=0.0, le=1.0, description="Entity prominence in first 200 tokens.")
    co_occurring_entities: List[str] = Field(default_factory=list, description="Related conceptual entities detected in DOM.")
    wikidata_links: Dict[str, str] = Field(default_factory=dict, description="Resolved Wikidata URI mappings for entity grounding.")
    triples: List[KnowledgeTriple] = Field(default_factory=list, description="Extracted knowledge graph semantic triples.")
    pronoun_anaphora_drift_count: int = Field(0, description="Ambiguous pronouns ('it', 'they', 'this') degrading vector embeddings.")


class EnginePrediction(BaseModel):
    engine_name: str = Field(..., description="'Perplexity Sonar', 'OpenAI SearchGPT', 'Google Gemini', 'Claude 3.5 Sonnet'")
    inclusion_probability: float = Field(..., ge=0.0, le=1.0, description="Predicted context-window inclusion probability.")
    primary_anchor_probability: float = Field(..., ge=0.0, le=1.0, description="Likelihood of receiving the [1] citation anchor.")
    retrieval_friction_points: List[str] = Field(default_factory=list, description="Why this engine's cross-encoder might downrank the passage.")


class ContentChunk(BaseModel):
    chunk_index: int
    heading_context: str
    token_count: int
    semantic_density_score: float
    chunk_text: str


class GenerativeSnippetRecommendations(BaseModel):
    recommended_bluf_opening: str = Field(..., description="Optimized direct-answer paragraph strictly under 50 words.")
    per_engine_predictions: List[EnginePrediction] = Field(default_factory=list)
    structured_chunk_recommendations: List[ContentChunk] = Field(default_factory=list)
    original_text_sample: str = Field(..., description="Original raw excerpt scraped from target page.")
    rewritten_optimized_text: str = Field(..., description="AI-rewritten, high-density version ready for side-by-side diff.")
    anaphora_replacements: List[Dict[str, str]] = Field(default_factory=list, description="Disambiguated pronoun fixes.")


class ScrapedTelemetry(BaseModel):
    title: str
    meta_description: str
    canonical_url: Optional[str] = None
    word_count: int
    reading_time_minutes: float
    h1_count: int
    h2_count: int
    table_count: int
    data_points_count: int
    content_to_html_ratio: float


class ActionItem(BaseModel):
    category: str = Field(..., description="'Direct Answer Density', 'Entity Saturation', 'Information Gain', 'Knowledge Graph', or 'LangGraph Pipeline'")
    title: str = Field(..., description="Actionable recommendation title.")
    impact_points: float = Field(..., description="Estimated score improvement in points.")
    priority: str = Field(..., description="'Critical', 'High', or 'Medium'")
    current_gap: str = Field(..., description="Current detected structural flaw.")
    exact_remediation: str = Field(..., description="Exact step-by-step instructions.")
    copyable_template: str = Field(..., description="Copyable code, markdown, or text snippet to paste into target site.")


class ScoreImprovementPlan(BaseModel):
    current_score: float
    current_grade: str
    projected_score: float
    projected_grade: str
    projected_citation_gain_pct: float
    dimension_potential: Dict[str, float] = Field(default_factory=dict)
    actions: List[ActionItem] = Field(default_factory=list)


class LangGraphPipelineMetrics(BaseModel):
    total_execution_ms: float
    nodes_executed: List[str] = Field(default_factory=list)
    node_timings_ms: Dict[str, float] = Field(default_factory=dict)
    state_transitions_count: int = 5
    retrieval_status: str = "Success"


class GeoAnalysisResponse(BaseModel):
    request_url: str
    target_entity: str
    scraped_telemetry: ScrapedTelemetry
    rag_readiness: RagReadinessScore
    entity_graph: EntityGraphData
    generative_snippets: GenerativeSnippetRecommendations
    schema_jsonld: Dict[str, Any] = Field(..., description="Machine-validated Schema.org @graph JSON-LD payload.")
    formatted_schema_tag: str = Field(..., description="HTML script tag ready for injection into <head>.")
    crawler_directives: Dict[str, str] = Field(default_factory=dict, description="robots.txt and llms.txt configurations.")
    improvement_plan: ScoreImprovementPlan = Field(..., description="Actionable score improvement roadmap and projections.")
    pipeline_metrics: LangGraphPipelineMetrics = Field(..., description="LangGraph execution telemetry across all state nodes.")
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
