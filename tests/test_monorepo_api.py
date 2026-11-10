"""
test_monorepo_api.py: Comprehensive Verification of api/ Services & FastAPI Endpoints
Tests the Vercel Serverless entry point and core GEO engine.
"""

import sys
import os

# Guarantee root directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from api.index import app
from api.services.scraper import is_interrogative_heading, AsyncWebScraper
from api.services.schema_builder import SchemaGraphBuilder
from api.schemas.seo_models import ScrapedContent, HeadingItem, AnalysisRequest
from api.services.geo_engine import GEOEvaluationEngine
from api.services.content_transformer import transform_content_for_rag
from api.services.simulator import RAGCitationSimulator
from api.services.crawler_configs import generate_crawler_configurations

def test_fastapi_serverless_app():
    assert app.title == "AiSeo — Enterprise Generative Engine Optimization (GEO) API"
    routes = [r.path for r in app.routes]
    assert "/analyze" in routes or "/api/analyze" in routes
    assert "/health" in routes or "/api/health" in routes
    print("[1/7] FastAPI Vercel Serverless Application: PASSED")

def test_scraper_interrogative():
    assert is_interrogative_heading("What is Generative Engine Optimization?") is True
    assert is_interrogative_heading("How Do Cross-Encoders Select Citations?") is True
    assert is_interrogative_heading("Core Architecture Specification") is False
    print("[2/7] Scraper Interrogative Classification: PASSED")

def test_geo_engine():
    scraped = ScrapedContent(
        url="https://typesafe.ai/geo-guide",
        status_code=200,
        title="Generative Engine Optimization Guide",
        meta_description="A complete guide to ranking as the top cited source across LLMs.",
        headings=[
            HeadingItem(level="h1", text="Generative Engine Optimization Guide", is_question=False),
            HeadingItem(level="h2", text="What is Generative Engine Optimization?", is_question=True),
        ],
        h1_tags=["Generative Engine Optimization Guide"],
        h2_tags=["What is Generative Engine Optimization?"],
        main_text="Generative Engine Optimization (GEO) is the discipline of optimizing web content to maximize inclusion and citation frequency in AI responses.",
        first_100_words="Generative Engine Optimization (GEO) is the discipline of optimizing web content to maximize inclusion and citation frequency in AI responses.",
        word_count=21,
        reading_time_minutes=0.1,
        content_to_html_ratio=0.28
    )

    engine = GEOEvaluationEngine(scraped=scraped, target_entity="Generative Engine Optimization")
    bluf = engine.evaluate_bluf()
    assert bluf.score >= 70.0
    print("[3/7] GEO Engine 5D Evaluation: PASSED")

def test_schema_builder():
    scraped = ScrapedContent(
        url="https://typesafe.ai/geo-guide",
        status_code=200,
        title="Generative Engine Optimization Guide",
        meta_description="A complete guide to ranking as the top cited source across LLMs.",
        headings=[],
        h1_tags=["Generative Engine Optimization Guide"],
        h2_tags=[],
        main_text="Generative Engine Optimization (GEO) leverages knowledge graph schemas and Wikidata entities.",
        first_100_words="Generative Engine Optimization (GEO) leverages knowledge graph schemas and Wikidata entities.",
        word_count=12,
        reading_time_minutes=0.06,
        content_to_html_ratio=0.25
    )

    schema_rec = SchemaGraphBuilder.build_schema_recommendations(scraped, "Generative Engine Optimization")
    assert "@graph" in schema_rec.jsonld_payload
    assert len(schema_rec.jsonld_payload["@graph"]) >= 3
    print("[4/7] Schema.org Knowledge Graph Generation: PASSED")

def test_content_transformer():
    scraped = ScrapedContent(
        url="https://typesafe.ai/geo-guide",
        status_code=200,
        title="Generative Engine Optimization Guide",
        meta_description="A complete guide to ranking as the top cited source across LLMs.",
        headings=[
            HeadingItem(level="h1", text="Generative Engine Optimization Guide", is_question=False),
        ],
        h1_tags=["Generative Engine Optimization Guide"],
        h2_tags=[],
        main_text="Generative Engine Optimization focuses on LLM context windows. It replaces legacy backlink strategies.",
        first_100_words="Generative Engine Optimization focuses on LLM context windows. It replaces legacy backlink strategies.",
        word_count=14,
        reading_time_minutes=0.07,
        content_to_html_ratio=0.25
    )

    trans = transform_content_for_rag(scraped, "Generative Engine Optimization")
    assert "Generative Engine Optimization" in trans.bluf_paragraph
    assert len(trans.sections) >= 1
    print("[5/7] RAG Content Transformer: PASSED")

def test_rag_citation_simulator():
    scraped = ScrapedContent(
        url="https://typesafe.ai/geo-guide",
        status_code=200,
        title="Generative Engine Optimization Guide",
        meta_description="A complete guide to ranking as the top cited source across LLMs.",
        headings=[],
        h1_tags=["Generative Engine Optimization Guide"],
        h2_tags=[],
        main_text="Generative Engine Optimization improves semantic retrieval and vector similarity scores in RAG architectures.",
        first_100_words="Generative Engine Optimization improves semantic retrieval and vector similarity scores in RAG architectures.",
        word_count=14,
        reading_time_minutes=0.07,
        content_to_html_ratio=0.25
    )

    sim = RAGCitationSimulator(scraped, "Generative Engine Optimization")
    res = sim.run_simulation()
    assert res.total_queries_simulated == 4
    assert len(res.engine_breakdown) == 4
    print("[6/7] Multi-Intent RAG Citation Simulator: PASSED")

def test_crawler_configs():
    scraped = ScrapedContent(
        url="https://typesafe.ai/geo-guide",
        status_code=200,
        title="Generative Engine Optimization Guide",
        meta_description="A complete guide to ranking as the top cited source across LLMs.",
        headings=[],
        h1_tags=["Generative Engine Optimization Guide"],
        h2_tags=[],
        main_text="Generative Engine Optimization guide content.",
        first_100_words="Generative Engine Optimization guide content.",
        word_count=5,
        reading_time_minutes=0.03,
        content_to_html_ratio=0.25
    )

    configs = generate_crawler_configurations(scraped, "Generative Engine Optimization")
    assert "GPTBot" in configs.robots_txt
    assert "PerplexityBot" in configs.robots_txt
    assert "llms.txt" in configs.llms_txt or "# Generative Engine Optimization" in configs.llms_txt
    print("[7/7] AI Crawler Configurations (robots.txt & llms.txt): PASSED")

if __name__ == "__main__":
    test_fastapi_serverless_app()
    test_scraper_interrogative()
    test_geo_engine()
    test_schema_builder()
    test_content_transformer()
    test_rag_citation_simulator()
    test_crawler_configs()
    print("\nAll 7 Monorepo API Verification Tests PASSED Successfully!")
