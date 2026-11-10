"""
seo_models.py: Strict Pydantic Contracts for AiSeo Platform
Defines type-safe data transfer objects between Backend and Next.js Frontend.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    url: str = Field(
        ...,
        description="Target webpage URL to audit and optimize for Generative Engine Search.",
        example="https://en.wikipedia.org/wiki/Retrieval-augmented_generation"
    )
    target_entity: Optional[str] = Field(
        None,
        description="Primary brand or entity name to ground and evaluate for salience and anaphora.",
        example="Retrieval-Augmented Generation"
    )
    timeout_seconds: Optional[int] = Field(
        15,
        ge=5,
        le=60,
        description="HTTP request timeout in seconds (optimized for Vercel Serverless limits)."
    )


class HeadingItem(BaseModel):
    level: str = Field(..., description="Heading level tag, e.g., 'h1', 'h2', 'h3'.")
    text: str = Field(..., description="Cleaned heading text.")
    is_question: bool = Field(False, description="Whether the heading is structured as an interrogative query.")


class TableRecord(BaseModel):
    headers: List[str] = Field(default_factory=list, description="Column headers extracted from HTML table.")
    rows: List[List[str]] = Field(default_factory=list, description="Row values extracted from HTML table.")
    markdown_representation: str = Field("", description="Synthesized Markdown table representation for RAG consumption.")


class ScrapedContent(BaseModel):
    url: str
    status_code: int
    title: str
    meta_description: str
    canonical_url: Optional[str] = None
    headings: List[HeadingItem] = Field(default_factory=list)
    h1_tags: List[str] = Field(default_factory=list)
    h2_tags: List[str] = Field(default_factory=list)
    h3_tags: List[str] = Field(default_factory=list)
    main_text: str
    first_100_words: str
    word_count: int
    reading_time_minutes: float
    tables: List[TableRecord] = Field(default_factory=list)
    existing_schemas: List[Dict[str, Any]] = Field(default_factory=list)
    content_to_html_ratio: float
    list_item_count: int = 0


class DimensionScore(BaseModel):
    name: str = Field(..., description="Dimension title (e.g. BLUF Direct Answer, Semantic Density).")
    score: float = Field(..., ge=0.0, le=100.0, description="Normalized score from 0 to 100.")
    weight: float = Field(..., ge=0.0, le=1.0, description="Weight in composite RRI calculation.")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Fine-grained algorithmic telemetry.")
    recommendations: List[str] = Field(default_factory=list, description="Targeted remediation steps.")


class CitationPrediction(BaseModel):
    tier: str = Field(..., description="High, Medium, Low, or Unlikely.")
    primary_citation_probability: float = Field(..., ge=0.0, le=1.0, description="Estimated probability of landing primary [1] anchor.")
    top_strengths: List[str] = Field(default_factory=list)
    critical_vulnerabilities: List[str] = Field(default_factory=list)


class AIQualitativeInsight(BaseModel):
    executive_assessment: str
    missing_latent_entities: List[str] = Field(default_factory=list)
    suggested_bluf_hook: str
    provider_used: str = Field("heuristic_engine", description="'gemini', 'openai', or 'heuristic_engine'")


class GeoScore(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Composite RAG-Readiness Index (RRI).")
    grade: str = Field(..., description="Letter grade: A+, A, B, C, or F.")
    citation_prediction: CitationPrediction
    dimensions: Dict[str, DimensionScore]
    actionable_checklist: List[str]
    ai_enhanced: bool = Field(False, description="Whether LLM inference contributed to the qualitative report.")
    ai_insight: Optional[AIQualitativeInsight] = None


class GroundedEntity(BaseModel):
    name: str
    wikidata_url: str
    relevance_type: str = Field("about", description="'about' or 'mentions'.")


class SchemaRecommendations(BaseModel):
    schema_type: str = Field(..., description="Primary Schema type, e.g., 'TechArticle+Graph' or 'FAQPage'.")
    jsonld_payload: Dict[str, Any] = Field(..., description="Interconnected @graph Schema.org JSON-LD object.")
    formatted_script_tag: str = Field(..., description="Ready-to-inject HTML script tag with JSON-LD.")
    entities_grounded: List[GroundedEntity] = Field(default_factory=list)
    faq_count: int = 0


class TransformedSection(BaseModel):
    heading: str
    content: str
    is_table: bool = False


class RAGTransformation(BaseModel):
    bluf_paragraph: str
    restructured_markdown: str
    sections: List[TransformedSection] = Field(default_factory=list)
    llms_txt_snippet: str
    anaphora_replacements_count: int = 0


class QuerySimulationMetric(BaseModel):
    query: str
    intent_type: str
    target_cited: bool
    citation_rank: Optional[int] = None
    rank_position_score: float
    attributed_token_share: float
    survived_cross_encoder: bool
    simulated_answer_snippet: str


class EngineCitationBreakdown(BaseModel):
    engine_name: str
    estimated_inclusion_rate: float
    primary_citation_rate: float
    risk_factors: List[str] = Field(default_factory=list)


class SimulationResult(BaseModel):
    target_url: str
    target_entity: str
    total_queries_simulated: int
    citation_success_rate: float
    mean_rank_position_score: float
    average_token_share: float
    query_details: List[QuerySimulationMetric] = Field(default_factory=list)
    engine_breakdown: List[EngineCitationBreakdown] = Field(default_factory=list)
    simulation_summary: str


class CrawlerConfigsResponse(BaseModel):
    robots_txt: str
    llms_txt: str
    llms_full_txt: str
    recommended_edge_rules: List[str] = Field(default_factory=list)


class FullAnalysisResponse(BaseModel):
    request_url: str
    target_entity: str
    scraped_summary: Dict[str, Any]
    geo_score: GeoScore
    schema_recommendations: SchemaRecommendations
    transformation: RAGTransformation
    simulation: SimulationResult
    crawler_configs: CrawlerConfigsResponse
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
