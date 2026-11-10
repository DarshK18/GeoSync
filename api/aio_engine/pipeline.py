"""
pipeline.py: LangGraph Orchestration Pipeline for AIO & GEO Analysis
Coordinates asynchronous scraping, knowledge graph entity linking, 3D AIO scoring,
generative snippet synthesis, and score improvement roadmap generation via a state graph.
"""

import logging
import time
from typing import Any, Dict, List, Optional, TypedDict
from urllib.parse import urlparse

from langgraph.graph import END, StateGraph

from api.aio_engine.analyzer import AioAnalyzer
from api.aio_engine.schema_builder import AioSchemaBuilder
from api.schemas.aio_models import (
    EntityGraphData,
    GenerativeSnippetRecommendations,
    GeoAnalysisResponse,
    LangGraphPipelineMetrics,
    RagReadinessScore,
    ScoreImprovementPlan,
    ScrapedTelemetry
)
from api.services.scraper import AsyncWebScraper

logger = logging.getLogger(__name__)


class AioGraphState(TypedDict, total=False):
    url: str
    target_entity: str
    timeout_seconds: int
    scraped_telemetry: ScrapedTelemetry
    main_text: str
    first_50_words: str
    tables: List[Dict[str, Any]]
    headings: List[Dict[str, Any]]
    faqs: List[Dict[str, str]]
    entity_graph: EntityGraphData
    rag_readiness: RagReadinessScore
    generative_snippets: GenerativeSnippetRecommendations
    schema_jsonld: Dict[str, Any]
    formatted_schema_tag: str
    crawler_directives: Dict[str, str]
    improvement_plan: ScoreImprovementPlan
    node_timings_ms: Dict[str, float]
    error: Optional[str]


async def scrape_node(state: AioGraphState) -> AioGraphState:
    """Node 1: Asynchronously ingests target URL DOM and extracts structural telemetry."""
    t0 = time.perf_counter()
    url = state["url"]
    timeout = state.get("timeout_seconds", 15)
    scraper = AsyncWebScraper(timeout_seconds=timeout)

    try:
        scraped = await scraper.scrape(url)
    except Exception as exc:
        logger.error(f"Scrape node failed for {url}: {exc}")
        return {**state, "error": str(exc)}

    # Determine or refine primary entity
    target_entity = state.get("target_entity")
    if not target_entity or not target_entity.strip():
        target_entity = (
            scraped.title.split("-")[0].split("|")[0].split("–")[0].strip()
            if scraped.title else "Primary Entity"
        )

    # Convert tables to dict format
    table_dicts = [
        {"headers": t.headers, "rows": t.rows, "markdown": t.markdown_representation}
        for t in scraped.tables
    ]

    # Convert headings to dicts
    heading_dicts = [
        {"level": h.level, "text": h.text, "is_question": h.is_question}
        for h in scraped.headings
    ]

    # Extract FAQs from interrogative headings
    faqs = []
    for h in scraped.headings:
        if h.is_question and len(h.text) > 10:
            faqs.append({
                "question": h.text,
                "answer": f"Direct answer and technical details regarding {h.text} in the context of {target_entity}."
            })

    telemetry = ScrapedTelemetry(
        title=scraped.title,
        meta_description=scraped.meta_description,
        canonical_url=scraped.canonical_url or scraped.url,
        word_count=scraped.word_count,
        reading_time_minutes=scraped.reading_time_minutes,
        h1_count=len(scraped.h1_tags),
        h2_count=len(scraped.h2_tags),
        table_count=len(scraped.tables),
        data_points_count=sum(len(t.rows) * max(1, len(t.headers)) for t in scraped.tables),
        content_to_html_ratio=scraped.content_to_html_ratio
    )

    timings = dict(state.get("node_timings_ms", {}))
    timings["scrape"] = round((time.perf_counter() - t0) * 1000, 2)

    return {
        **state,
        "target_entity": target_entity,
        "scraped_telemetry": telemetry,
        "main_text": scraped.main_text,
        "first_50_words": scraped.first_100_words,
        "tables": table_dicts,
        "headings": heading_dicts,
        "faqs": faqs,
        "node_timings_ms": timings
    }


def entity_graph_node(state: AioGraphState) -> AioGraphState:
    """Node 2: Constructs knowledge graph entity triples and resolves Wikidata URIs."""
    if state.get("error"):
        return state

    t0 = time.perf_counter()
    entity_graph = AioSchemaBuilder.build_entity_graph(
        url=state["url"],
        target_entity=state["target_entity"],
        text_corpus=state["main_text"],
        headings=state["headings"]
    )
    timings = dict(state.get("node_timings_ms", {}))
    timings["entity_graph"] = round((time.perf_counter() - t0) * 1000, 2)

    return {**state, "entity_graph": entity_graph, "node_timings_ms": timings}


def aio_analysis_node(state: AioGraphState) -> AioGraphState:
    """Node 3: Evaluates Direct Answer Density, Semantic Entity Saturation, and Information Gain."""
    if state.get("error"):
        return state

    t0 = time.perf_counter()
    analyzer = AioAnalyzer(target_entity=state["target_entity"])
    telemetry = state["scraped_telemetry"]

    # 1. Direct Answer Density (first 50 words)
    direct_answer = analyzer.evaluate_direct_answer_density(
        first_50_words=state["first_50_words"],
        title=telemetry.title
    )

    # 2. Semantic Entity Saturation
    semantic_entity = analyzer.evaluate_semantic_entity_saturation(
        main_text=state["main_text"],
        entity_graph=state["entity_graph"]
    )

    # 3. Information Gain (data tables, numeric stats)
    info_gain = analyzer.evaluate_information_gain(
        main_text=state["main_text"],
        table_count=telemetry.table_count,
        data_points_count=telemetry.data_points_count,
        word_count=telemetry.word_count
    )

    # Composite RAG Readiness
    rag_readiness = analyzer.compute_rag_readiness(
        direct_answer=direct_answer,
        semantic_entity=semantic_entity,
        info_gain=info_gain
    )

    timings = dict(state.get("node_timings_ms", {}))
    timings["aio_analysis"] = round((time.perf_counter() - t0) * 1000, 2)

    return {**state, "rag_readiness": rag_readiness, "node_timings_ms": timings}


def snippet_generation_node(state: AioGraphState) -> AioGraphState:
    """Node 4: Synthesizes LLM-optimized BLUF opening, chunking, and side-by-side rewrite text."""
    if state.get("error"):
        return state

    t0 = time.perf_counter()
    analyzer = AioAnalyzer(target_entity=state["target_entity"])
    table_md = state["tables"][0]["markdown"] if state.get("tables") else None

    snippets = analyzer.synthesize_snippets_and_rewrite(
        main_text=state["main_text"],
        first_50_words=state["first_50_words"],
        entity_graph=state["entity_graph"],
        table_markdown=table_md
    )
    timings = dict(state.get("node_timings_ms", {}))
    timings["snippets"] = round((time.perf_counter() - t0) * 1000, 2)

    return {**state, "generative_snippets": snippets, "node_timings_ms": timings}


def schema_synthesis_node(state: AioGraphState) -> AioGraphState:
    """Node 5: Generates machine-validated Schema.org JSON-LD @graph, crawler directives, and action plan."""
    if state.get("error"):
        return state

    t0 = time.perf_counter()
    telemetry = state["scraped_telemetry"]
    jsonld = AioSchemaBuilder.generate_jsonld_payload(
        url=state["url"],
        title=telemetry.title,
        meta_description=telemetry.meta_description,
        target_entity=state["target_entity"],
        entity_graph=state["entity_graph"],
        faqs=state.get("faqs", []),
        data_tables=state.get("tables", [])
    )
    script_tag = AioSchemaBuilder.format_script_tag(jsonld)

    # AI Crawler Directives (robots.txt & llms.txt)
    domain = urlparse(state["url"]).netloc or "example.com"
    robots_txt = (
        f"# AI Crawler Directives for {domain}\n"
        "User-agent: Google-Extended\nAllow: /\n\n"
        "User-agent: PerplexityBot\nAllow: /\n\n"
        "User-agent: GPTBot\nAllow: /\n\n"
        "User-agent: ClaudeBot\nAllow: /\n\n"
        f"Sitemap: https://{domain}/sitemap.xml\n"
    )
    llms_txt = (
        f"# {state['target_entity']}\n\n"
        f"> {state['generative_snippets'].recommended_bluf_opening}\n\n"
        f"- [Canonical Documentation]({state['url']}): Primary authoritative reference for {state['target_entity']}.\n"
    )

    # Synthesize concrete Score Improvement Plan
    analyzer = AioAnalyzer(target_entity=state["target_entity"])
    table_md = state["tables"][0]["markdown"] if state.get("tables") else None
    plan = analyzer.synthesize_score_improvement_plan(
        rag_readiness=state["rag_readiness"],
        entity_graph=state["entity_graph"],
        snippets=state["generative_snippets"],
        scraped_telemetry=telemetry,
        table_markdown=table_md,
        schema_tag=script_tag,
        llms_txt=llms_txt
    )

    timings = dict(state.get("node_timings_ms", {}))
    timings["schema"] = round((time.perf_counter() - t0) * 1000, 2)

    return {
        **state,
        "schema_jsonld": jsonld,
        "formatted_schema_tag": script_tag,
        "crawler_directives": {
            "robots_txt": robots_txt,
            "llms_txt": llms_txt
        },
        "improvement_plan": plan,
        "node_timings_ms": timings
    }


def build_aio_pipeline():
    """Builds and compiles the LangGraph StateGraph pipeline."""
    workflow = StateGraph(AioGraphState)

    workflow.add_node("scrape", scrape_node)
    workflow.add_node("entity_graph", entity_graph_node)
    workflow.add_node("aio_analysis", aio_analysis_node)
    workflow.add_node("snippets", snippet_generation_node)
    workflow.add_node("schema", schema_synthesis_node)

    workflow.set_entry_point("scrape")
    workflow.add_edge("scrape", "entity_graph")
    workflow.add_edge("entity_graph", "aio_analysis")
    workflow.add_edge("aio_analysis", "snippets")
    workflow.add_edge("snippets", "schema")
    workflow.add_edge("schema", END)

    return workflow.compile()


aio_graph = build_aio_pipeline()


async def run_aio_pipeline(
    url: str,
    target_entity: Optional[str] = None,
    timeout_seconds: int = 15
) -> GeoAnalysisResponse:
    """Executes the complete LangGraph pipeline and returns a type-safe GeoAnalysisResponse."""
    t_start = time.perf_counter()
    initial_state: AioGraphState = {
        "url": url,
        "target_entity": target_entity or "",
        "timeout_seconds": timeout_seconds,
        "node_timings_ms": {}
    }

    final_state = await aio_graph.ainvoke(initial_state)

    if final_state.get("error"):
        raise RuntimeError(f"AIO Pipeline Error: {final_state['error']}")

    total_ms = round((time.perf_counter() - t_start) * 1000, 2)

    pipeline_metrics = LangGraphPipelineMetrics(
        total_execution_ms=total_ms,
        nodes_executed=["scrape", "entity_graph", "aio_analysis", "snippets", "schema"],
        node_timings_ms=final_state.get("node_timings_ms", {}),
        state_transitions_count=5,
        retrieval_status="Success"
    )

    return GeoAnalysisResponse(
        request_url=final_state["url"],
        target_entity=final_state["target_entity"],
        scraped_telemetry=final_state["scraped_telemetry"],
        rag_readiness=final_state["rag_readiness"],
        entity_graph=final_state["entity_graph"],
        generative_snippets=final_state["generative_snippets"],
        schema_jsonld=final_state["schema_jsonld"],
        formatted_schema_tag=final_state["formatted_schema_tag"],
        crawler_directives=final_state["crawler_directives"],
        improvement_plan=final_state["improvement_plan"],
        pipeline_metrics=pipeline_metrics
    )
