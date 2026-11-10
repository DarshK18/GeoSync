"""
test_geo_platform.py: End-to-End Test Suite for AI SEO / GEO Platform
Verifies Scraper logic, GEO Analyzer metrics, Schema Generation, and FastAPI Endpoints.
"""

import os
import sys

# Ensure repository root is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from bs4 import BeautifulSoup

from app.scraper import (
    HeadingItem,
    ScrapedContent,
    TableData,
    is_interrogative_heading,
    table_to_markdown
)
from app.geo_analyzer import GEOAnalyzer, analyze_content
from app.schema_generator import (
    extract_entities_from_text,
    extract_faq_pairs,
    generate_optimized_schema
)
from app.main import (
    app,
    health_check,
    root,
    generate_schema_endpoint,
    SchemaGenerationRequest
)

SAMPLE_MOCK_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vector Databases Explained: The Complete Technical Guide</title>
    <meta name="description" content="Vector databases are specialized storage engines for dense high-dimensional vectors, powering modern AI retrieval.">
    <link rel="canonical" href="https://example.com/vector-databases">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Vector Databases Explained",
        "author": {
            "@type": "Organization",
            "name": "AI SEO Labs"
        }
    }
    </script>
</head>
<body>
    <header>
        <nav><a href="/">Home</a> | <a href="/blog">Blog</a></nav>
    </header>
    <main>
        <h1>Vector Databases Explained: The Complete Technical Guide</h1>
        <p>A vector database is a specialized storage engine designed specifically to index, store, and query high-dimensional embeddings efficiently. By utilizing approximate nearest neighbor search algorithms such as Hierarchical Navigable Small World graphs and Inverted File indexes, vector databases enable millisecond similarity searches across billions of unstructured multimodal data objects.</p>

        <h2>What is a Vector Database?</h2>
        <p>Vector databases index dense numerical representations of unstructured data. Unlike traditional relational databases that query exact scalar values using B-Trees, vector databases compute vector distance metrics like cosine similarity and Euclidean distance.</p>

        <h2>How Does Vector Search Compare to Relational Search?</h2>
        <p>The primary difference lies in indexing mechanics and mathematical retrieval paradigms.</p>

        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Relational Database</th>
                    <th>Vector Database</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Indexing Paradigm</td>
                    <td>B-Tree / LSM-Tree</td>
                    <td>HNSW / IVF-PQ Graphs</td>
                </tr>
                <tr>
                    <td>Query Target</td>
                    <td>Exact Scalar Match</td>
                    <td>Semantic Similarity</td>
                </tr>
                <tr>
                    <td>Query Latency</td>
                    <td>Sub-millisecond</td>
                    <td>2 to 10 milliseconds</td>
                </tr>
            </tbody>
        </table>

        <h2>Why is Retrieval-Augmented Generation Dependent on Vector Search?</h2>
        <p>Retrieval-Augmented Generation connects frozen large language models with dynamic enterprise facts. Vector indexing ensures that the most semantically relevant chunks are retrieved and injected into the model's context window before token synthesis occurs.</p>

        <ul>
            <li>Eliminates model hallucination by grounding answers in verified facts.</li>
            <li>Enables real-time domain adaptation without expensive fine-tuning.</li>
            <li>Supports multimodal retrieval across text, audio, and images.</li>
        </ul>
    </main>
    <footer>
        <p>Copyright 2026 AI SEO Platform. All rights reserved.</p>
    </footer>
</body>
</html>
"""


def run_coroutine(coro):
    """Executes a non-awaiting coroutine without requiring OS socket-pair loopback."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not complete synchronously.")


def test_interrogative_heading_detection():
    print("1. Testing interrogative heading detection...")
    assert is_interrogative_heading("What is a Vector Database?") is True
    assert is_interrogative_heading("How Does Vector Search Work?") is True
    assert is_interrogative_heading("Why Choose Modern RAG Architectures?") is True
    assert is_interrogative_heading("Architecture Overview") is False
    print("   -> PASSED")


def test_table_to_markdown():
    print("2. Testing table to markdown parser...")
    soup = BeautifulSoup(SAMPLE_MOCK_HTML, "html.parser")
    tbl = soup.find("table")
    assert tbl is not None
    table_data = table_to_markdown(tbl)
    assert len(table_data.headers) == 3
    assert len(table_data.rows) == 3
    assert "| Feature | Relational Database | Vector Database |" in table_data.markdown_representation
    assert "HNSW / IVF-PQ Graphs" in table_data.markdown_representation
    print("   -> PASSED")


def test_geo_analyzer_metrics():
    print("3. Testing GEO Analyzer scoring engine...")
    soup = BeautifulSoup(SAMPLE_MOCK_HTML, "html.parser")
    body_text = "\n\n".join([p.get_text() for p in soup.find_all("p")])
    words = body_text.split()
    scraped = ScrapedContent(
        url="https://example.com/vector-databases",
        status_code=200,
        title="Vector Databases Explained: The Complete Technical Guide",
        meta_description="Vector databases are specialized storage engines for dense high-dimensional vectors.",
        canonical_url="https://example.com/vector-databases",
        headings=[
            HeadingItem(level="h1", text="Vector Databases Explained", is_question=False),
            HeadingItem(level="h2", text="What is a Vector Database?", is_question=True),
            HeadingItem(level="h2", text="How Does Vector Search Compare to Relational Search?", is_question=True),
            HeadingItem(level="h2", text="Why is Retrieval-Augmented Generation Dependent on Vector Search?", is_question=True),
        ],
        h1_tags=["Vector Databases Explained"],
        h2_tags=[
            "What is a Vector Database?",
            "How Does Vector Search Compare to Relational Search?",
            "Why is Retrieval-Augmented Generation Dependent on Vector Search?"
        ],
        main_text=body_text,
        first_100_words=" ".join(words[:100]),
        word_count=len(words),
        estimated_reading_time_minutes=round(len(words) / 200.0, 2),
        existing_schemas=[{"@type": "Article", "headline": "Vector Databases"}],
        tables=[table_to_markdown(soup.find("table"))],
        has_table=True,
        list_item_count=3,
        raw_html_length=len(SAMPLE_MOCK_HTML),
        content_to_html_ratio=0.25
    )

    report = analyze_content(scraped, target_entity="Vector Database")
    print(f"   -> Overall RRI Score: {report.overall_rag_readiness_score}/100 (Grade: {report.grade})")
    assert report.overall_rag_readiness_score > 70.0
    assert report.grade in ["A+", "A", "B"]
    assert report.dimensions["bluf_direct_answer"].score >= 70.0
    assert report.dimensions["structure_and_tables"].score >= 80.0
    assert report.citation_prediction.predicted_citation_tier in ["High", "Medium"]
    print("   -> PASSED")


def test_schema_generator():
    print("4. Testing Schema.org JSON-LD generator...")
    soup = BeautifulSoup(SAMPLE_MOCK_HTML, "html.parser")
    body_text = "\n\n".join([p.get_text() for p in soup.find_all("p")])
    words = body_text.split()
    scraped = ScrapedContent(
        url="https://example.com/vector-databases",
        status_code=200,
        title="Vector Databases Explained",
        meta_description="Vector databases are specialized storage engines.",
        canonical_url="https://example.com/vector-databases",
        headings=[
            HeadingItem(level="h1", text="Vector Databases Explained", is_question=False),
            HeadingItem(level="h2", text="What is a Vector Database?", is_question=True),
        ],
        h1_tags=["Vector Databases Explained"],
        h2_tags=["What is a Vector Database?"],
        main_text=body_text,
        first_100_words=" ".join(words[:100]),
        word_count=len(words),
        estimated_reading_time_minutes=round(len(words) / 200.0, 2),
        existing_schemas=[],
        tables=[],
        has_table=False,
        list_item_count=0,
        raw_html_length=len(SAMPLE_MOCK_HTML),
        content_to_html_ratio=0.25
    )

    schema_result = generate_optimized_schema(scraped, preferred_type="TechArticle", use_llm=False)
    assert schema_result.schema_jsonld["@context"] == "https://schema.org"
    assert "@graph" in schema_result.schema_jsonld
    assert len(schema_result.schema_jsonld["@graph"]) >= 3

    # Check for Wikidata entity grounding
    has_wikidata = False
    for node in schema_result.schema_jsonld["@graph"]:
        if "about" in node:
            for item in node["about"]:
                if "wikidata.org" in item.get("sameAs", ""):
                    has_wikidata = True
    assert has_wikidata is True
    print("   -> PASSED")


def test_fastapi_endpoints():
    print("5. Testing FastAPI endpoints...")

    # 1. Root & Health check
    from starlette.requests import Request
    mock_req = Request({"type": "http", "headers": [(b"accept", b"text/html")]})
    res_root = run_coroutine(root(mock_req))
    assert res_root.status_code == 200

    res_health = run_coroutine(health_check())
    assert res_health["status"] == "healthy"
    assert res_health["gemini_configured"] is True

    # 2. Schema generator endpoint with raw text
    req = SchemaGenerationRequest(
        content="A Vector Database is a specialized storage engine for embeddings and RAG systems.",
        title="Vector Databases in 2026",
        schema_type="TechArticle",
        use_llm=False
    )
    res_schema = run_coroutine(generate_schema_endpoint(req))
    assert "@graph" in res_schema.schema_jsonld
    assert res_schema.entity_count >= 1
    print("   -> PASSED")


if __name__ == "__main__":
    test_interrogative_heading_detection()
    test_table_to_markdown()
    test_geo_analyzer_metrics()
    test_schema_generator()
    test_fastapi_endpoints()
    print("\n=======================================================")
    print("  ALL END-TO-END GEO PLATFORM TESTS PASSED (5/5)       ")
    print("=======================================================")
