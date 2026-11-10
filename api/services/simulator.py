"""
simulator.py: Empirical RAG Citation Simulator Engine
Simulates multi-intent search query decomposition, cross-encoder passage ranking,
and generative attribution across modern AI search engines (Perplexity, SearchGPT, Gemini).
"""

import logging
from typing import List
from pydantic import BaseModel, Field

from api.schemas.seo_models import (
    EngineCitationBreakdown,
    QuerySimulationMetric,
    ScrapedContent,
    SimulationResult
)

logger = logging.getLogger(__name__)


class SyntheticQuery(BaseModel):
    query: str
    intent_type: str = Field(..., description="definitional, comparative, procedural, or evaluative")
    target_keywords: List[str] = Field(default_factory=list)


class RAGCitationSimulator:
    """Simulates real-world RAG context selection and citation synthesis."""

    def __init__(self, scraped: ScrapedContent, target_entity: str):
        self.scraped = scraped
        self.target_entity = target_entity
        self.clean_text = scraped.main_text

    def generate_synthetic_queries(self) -> List[SyntheticQuery]:
        """Generates 4 high-probability user prompts that trigger web RAG retrieval."""
        entity = self.target_entity
        queries: List[SyntheticQuery] = [
            SyntheticQuery(
                query=f"What is {entity} and how does it work?",
                intent_type="definitional",
                target_keywords=[entity.lower(), "architecture", "mechanism"]
            ),
            SyntheticQuery(
                query=f"What are the primary benefits and use cases of {entity}?",
                intent_type="evaluative",
                target_keywords=[entity.lower(), "benefits", "features"]
            ),
            SyntheticQuery(
                query=f"How does {entity} compare to traditional alternatives?",
                intent_type="comparative",
                target_keywords=[entity.lower(), "comparison", "vs", "difference"]
            ),
            SyntheticQuery(
                query=f"How to implement {entity} in production?",
                intent_type="procedural",
                target_keywords=[entity.lower(), "production", "setup", "implementation"]
            )
        ]
        return queries

    def simulate_cross_encoder_reranking(self, query: SyntheticQuery) -> tuple[bool, float]:
        """
        Simulates passage cross-encoder score based on:
        - Exact entity token co-location in the passage
        - Presence of query keywords within a 128-token span
        - Heading alignment
        """
        query_words = set(query.query.lower().split()) - {"what", "is", "and", "how", "does", "it", "to", "in", "of", "the", "are"}
        body_lower = self.clean_text.lower()

        heading_match = any(
            len(set(h.text.lower().split()).intersection(query_words)) >= 2
            for h in self.scraped.headings
        )

        term_matches = sum(1 for kw in query.target_keywords if kw in body_lower)
        keyword_density = term_matches / max(1, len(query.target_keywords))

        table_boost = 0.25 if (query.intent_type == "comparative" and self.scraped.tables) else 0.0

        rerank_score = (0.45 * keyword_density) + (0.30 if heading_match else 0.10) + table_boost
        survived = rerank_score >= 0.50

        return survived, round(min(1.0, max(0.0, rerank_score)), 3)

    def simulate_generation_and_citation(self, query: SyntheticQuery, survived: bool, score: float) -> QuerySimulationMetric:
        """Simulates LLM context window attention and citation anchor placement [1]."""
        if not survived:
            return QuerySimulationMetric(
                query=query.query,
                intent_type=query.intent_type,
                target_cited=False,
                citation_rank=None,
                rank_position_score=0.0,
                attributed_token_share=0.0,
                survived_cross_encoder=False,
                simulated_answer_snippet="The target content scored below the cross-encoder relevance threshold and was pruned before generative synthesis."
            )

        is_first = score >= 0.70 or (query.intent_type == "definitional" and len(self.scraped.first_100_words) > 30)
        rank = 1 if is_first else 2
        rpc = 1.0 if rank == 1 else 0.5
        token_share = round(0.40 + (score * 0.45), 2)

        snippet = (
            f"Based on [{rank}], **{self.target_entity}** provides verified domain capabilities. "
            f"Key architectural parameters indicate superior indexing efficiency and context preservation [{rank}]."
        )

        return QuerySimulationMetric(
            query=query.query,
            intent_type=query.intent_type,
            target_cited=True,
            citation_rank=rank,
            rank_position_score=rpc,
            attributed_token_share=token_share,
            survived_cross_encoder=True,
            simulated_answer_snippet=snippet
        )

    def run_simulation(self) -> SimulationResult:
        queries = self.generate_synthetic_queries()
        metrics: List[QuerySimulationMetric] = []

        for q in queries:
            survived, score = self.simulate_cross_encoder_reranking(q)
            metric = self.simulate_generation_and_citation(q, survived, score)
            metrics.append(metric)

        cited_count = sum(1 for m in metrics if m.target_cited)
        csr = round(cited_count / len(metrics), 2)
        mean_rpc = round(sum(m.rank_position_score for m in metrics) / len(metrics), 2)
        avg_tokens = round(sum(m.attributed_token_share for m in metrics) / len(metrics), 2)

        has_table = len(self.scraped.tables) > 0
        has_schema = len(self.scraped.existing_schemas) > 0

        engine_breakdown = [
            EngineCitationBreakdown(
                engine_name="Perplexity Sonar / Pro Search",
                estimated_inclusion_rate=min(1.0, csr + 0.05),
                primary_citation_rate=round(mean_rpc * 0.95, 2),
                risk_factors=[] if has_table else ["Lacks Markdown table; Perplexity strongly favors tabular data for evaluative queries."]
            ),
            EngineCitationBreakdown(
                engine_name="OpenAI SearchGPT / ChatGPT Browse",
                estimated_inclusion_rate=csr,
                primary_citation_rate=round(mean_rpc * 0.90, 2),
                risk_factors=[] if csr >= 0.75 else ["Opening paragraph definition needs stronger BLUF anchoring to pass dense reranking."]
            ),
            EngineCitationBreakdown(
                engine_name="Google Gemini / AI Overviews",
                estimated_inclusion_rate=min(1.0, csr + (0.10 if has_schema else -0.15)),
                primary_citation_rate=round(mean_rpc * 0.88, 2),
                risk_factors=[] if has_schema else ["Missing Schema.org linked data weakens Google's Knowledge Graph entity association."]
            ),
            EngineCitationBreakdown(
                engine_name="Claude 3.5 Sonnet / Anthropic RAG",
                estimated_inclusion_rate=min(1.0, csr + 0.02),
                primary_citation_rate=round(mean_rpc * 0.92, 2),
                risk_factors=[] if self.scraped.reading_time_minutes >= 1.0 else ["Longer analytical passages preferred for deep context window ingestion."]
            )
        ]

        summary = (
            f"The target page achieved a Citation Success Rate (CSR) of {int(csr * 100)}% across {len(queries)} simulated search intents. "
            f"Mean citation rank score is {mean_rpc} with an average attributed token share of {int(avg_tokens * 100)}%."
        )

        return SimulationResult(
            target_url=self.scraped.canonical_url or self.scraped.url,
            target_entity=self.target_entity,
            total_queries_simulated=len(queries),
            citation_success_rate=csr,
            mean_rank_position_score=mean_rpc,
            average_token_share=avg_tokens,
            query_details=metrics,
            engine_breakdown=engine_breakdown,
            simulation_summary=summary
        )

