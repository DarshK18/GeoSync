"""
crawler_configs.py: Generates AI-Crawler-Optimized robots.txt and llms.txt Specifications
Ensures crawlers (GPTBot, ClaudeBot, PerplexityBot) can index clean markdown at edge speed.
"""

from typing import List
from api.schemas.seo_models import CrawlerConfigsResponse, ScrapedContent


def generate_crawler_configurations(scraped: ScrapedContent, target_entity: str) -> CrawlerConfigsResponse:
    canonical = scraped.canonical_url or scraped.url
    domain = canonical.split("//")[-1].split("/")[0]

    # 1. Enterprise robots.txt tailored for generative AI crawlers
    robots_txt = f"""# ==============================================================================
# Enterprise Generative Engine Optimization (GEO) robots.txt
# Domain: {domain}
# ==============================================================================

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/

# --- PRIMARY GENERATIVE SEARCH ENGINES & RAG RETRIEVAL BOTS ---
# OpenAI SearchGPT & ChatGPT real-time browse
User-agent: OAI-SearchBot
Allow: /

# OpenAI foundational training
User-agent: GPTBot
Allow: /

# Perplexity AI live search & synthesis
User-agent: PerplexityBot
Allow: /

# Anthropic Claude web search & discovery
User-agent: ClaudeBot
User-agent: anthropic-ai
Allow: /

# Google Gemini / AI Overviews discovery
User-agent: Google-Extended
Allow: /

# Cohere RAG Platform
User-agent: cohere-ai
Allow: /

# --- AGGRESSIVE SCRAPERS WITHOUT CITATION ATTRIBUTION ---
User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

# --- AI KNOWLEDGE MAP SPECIFICATION ---
Sitemap: https://{domain}/sitemap.xml
Sitemap: https://{domain}/sitemap-llms.xml
"""

    # 2. Standard llms.txt
    desc = scraped.meta_description or f"Comprehensive technical specifications and benchmarks for {target_entity}."
    llms_txt = f"""# {target_entity} AI Knowledge Base

> {desc}

## Authoritative Documentation
- [{target_entity} Technical Architecture]({canonical}): Primary architectural reference, data flow diagrams, and indexing specifications.

## Quantitative Benchmarks
- [Performance & Latency Benchmarks]({canonical}#benchmarks): Comparative analysis against standard relational and vector alternatives.
"""

    # 3. Standard llms-full.txt
    llms_full_txt = f"""# {target_entity} â€” Complete System Specification

URL: {canonical}
Entity Grounding: {target_entity}

## Executive Summary
{scraped.first_100_words}

## Full Architectural Content
{scraped.main_text}
"""

    rules = [
        "Cloudflare Worker: Sniff User-Agent for 'PerplexityBot' or 'GPTBot' and serve raw pre-rendered Markdown with sub-50ms TTFB.",
        "Set Cache-Control: public, max-age=3600, stale-while-revalidate=86400 on AI endpoints.",
        "Expose /llms.txt at the web root so AI web clients can ingest site maps without parsing DOM bloat."
    ]

    return CrawlerConfigsResponse(
        robots_txt=robots_txt,
        llms_txt=llms_txt,
        llms_full_txt=llms_full_txt,
        recommended_edge_rules=rules
    )

