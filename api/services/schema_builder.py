"""
schema_builder.py: Automated Schema.org JSON-LD Knowledge Graph Builder
Constructs interconnected @graph payloads linking canonical Wikidata entities
and synthesizing Article, Organization, and FAQPage nodes.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from api.schemas.seo_models import (
    GroundedEntity,
    HeadingItem,
    ScrapedContent,
    SchemaRecommendations
)

logger = logging.getLogger(__name__)

# Canonical Wikidata mapping for authoritative technical concepts
WIKIDATA_ENTITIES = {
    "artificial intelligence": "https://www.wikidata.org/wiki/Q11660",
    "ai": "https://www.wikidata.org/wiki/Q11660",
    "machine learning": "https://www.wikidata.org/wiki/Q2539",
    "deep learning": "https://www.wikidata.org/wiki/Q197536",
    "natural language processing": "https://www.wikidata.org/wiki/Q30642",
    "nlp": "https://www.wikidata.org/wiki/Q30642",
    "large language model": "https://www.wikidata.org/wiki/Q115328405",
    "llm": "https://www.wikidata.org/wiki/Q115328405",
    "retrieval-augmented generation": "https://www.wikidata.org/wiki/Q124334346",
    "rag": "https://www.wikidata.org/wiki/Q124334346",
    "vector database": "https://www.wikidata.org/wiki/Q115682352",
    "search engine optimization": "https://www.wikidata.org/wiki/Q180711",
    "seo": "https://www.wikidata.org/wiki/Q180711",
    "python": "https://www.wikidata.org/wiki/Q28865",
    "fastapi": "https://www.wikidata.org/wiki/Q104884214",
    "next.js": "https://www.wikidata.org/wiki/Q110823493",
    "typescript": "https://www.wikidata.org/wiki/Q9824",
    "cloud computing": "https://www.wikidata.org/wiki/Q483247",
    "api": "https://www.wikidata.org/wiki/Q165134",
    "schema.org": "https://www.wikidata.org/wiki/Q3475330"
}


class SchemaGraphBuilder:
    """Enterprise Schema.org builder constructing valid linked data knowledge graphs."""

    @staticmethod
    def extract_grounded_entities(text: str, max_count: int = 6) -> List[GroundedEntity]:
        text_lower = text.lower()
        grounded: List[GroundedEntity] = []
        seen = set()

        for term, url in WIKIDATA_ENTITIES.items():
            if re.search(r"\b" + re.escape(term) + r"\b", text_lower) and url not in seen:
                rel = "about" if len(grounded) < 2 else "mentions"
                grounded.append(GroundedEntity(name=term.title(), wikidata_url=url, relevance_type=rel))
                seen.add(url)
                if len(grounded) >= max_count:
                    break

        if len(grounded) < 2:
            caps = re.findall(r"\b[A-Z][a-zA-Z0-9_-]+(?:\s+[A-Z][a-zA-Z0-9_-]+)?\b", text)
            for c in caps:
                if len(c) > 3 and c not in [g.name for g in grounded]:
                    grounded.append(GroundedEntity(
                        name=c,
                        wikidata_url=f"https://en.wikipedia.org/wiki/{c.replace(' ', '_')}",
                        relevance_type="mentions"
                    ))
                    if len(grounded) >= max_count:
                        break

        return grounded

    @staticmethod
    def extract_faq_pairs(scraped: ScrapedContent) -> List[Dict[str, str]]:
        faqs: List[Dict[str, str]] = []
        paragraphs = [p.strip() for p in scraped.main_text.split("\n\n") if len(p.strip()) > 20]

        for h in scraped.headings:
            if h.is_question:
                # Find matching paragraph
                matched_answer = ""
                for idx, p in enumerate(paragraphs):
                    if h.text in p:
                        if idx + 1 < len(paragraphs):
                            matched_answer = paragraphs[idx + 1]
                        break
                if not matched_answer:
                    for p in paragraphs:
                        if p != h.text and any(k.lower() in p.lower() for k in h.text.split()[:2]):
                            matched_answer = p
                            break

                if matched_answer:
                    sentences = re.split(r"(?<=[.!?])\s+", matched_answer)
                    short_ans = " ".join(sentences[:3])
                    faqs.append({"question": h.text, "answer": short_ans})

        return faqs

    @classmethod
    def build_schema_recommendations(
        cls,
        scraped: ScrapedContent,
        target_entity: str,
        publisher_name: str = "Authoritative Knowledge Resource"
    ) -> SchemaRecommendations:
        canonical_url = scraped.canonical_url or scraped.url
        entities = cls.extract_grounded_entities(scraped.main_text, max_count=6)
        faq_pairs = cls.extract_faq_pairs(scraped)

        graph_nodes: List[Dict[str, Any]] = []

        # 1. Organization Node
        org_id = f"{canonical_url}#/schema/organization"
        graph_nodes.append({
            "@type": "Organization",
            "@id": org_id,
            "name": publisher_name,
            "url": canonical_url
        })

        # 2. WebPage Node
        webpage_id = f"{canonical_url}#/schema/webpage"
        graph_nodes.append({
            "@type": "WebPage",
            "@id": webpage_id,
            "url": canonical_url,
            "name": scraped.title or target_entity,
            "description": scraped.meta_description or scraped.first_100_words[:160],
            "isPartOf": {"@id": f"{canonical_url}#/schema/website"}
        })

        # 3. Primary TechArticle Node
        about_nodes = [
            {"@type": "Thing", "name": e.name, "sameAs": e.wikidata_url}
            for e in entities if e.relevance_type == "about"
        ]
        mentions_nodes = [
            {"@type": "Thing", "name": e.name, "sameAs": e.wikidata_url}
            for e in entities if e.relevance_type == "mentions"
        ]

        article_node: Dict[str, Any] = {
            "@type": "TechArticle",
            "@id": f"{canonical_url}#/schema/techarticle",
            "url": canonical_url,
            "headline": scraped.h1_tags[0] if scraped.h1_tags else (scraped.title or target_entity),
            "description": scraped.meta_description or (scraped.first_100_words[:160] + "..."),
            "inLanguage": "en-US",
            "mainEntityOfPage": webpage_id,
            "publisher": {"@id": org_id},
            "wordCount": scraped.word_count,
            "about": about_nodes,
            "mentions": mentions_nodes
        }
        graph_nodes.append(article_node)

        # 4. FAQPage Node
        if faq_pairs:
            faq_entities = [
                {
                    "@type": "Question",
                    "name": pair["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": pair["answer"]
                    }
                }
                for pair in faq_pairs
            ]
            graph_nodes.append({
                "@type": "FAQPage",
                "@id": f"{canonical_url}#/schema/faqpage",
                "url": canonical_url,
                "mainEntity": faq_entities
            })

        jsonld = {
            "@context": "https://schema.org",
            "@graph": graph_nodes
        }

        formatted = f'<script type="application/ld+json">\n{json.dumps(jsonld, indent=2)}\n</script>'

        return SchemaRecommendations(
            schema_type="TechArticle+Graph",
            jsonld_payload=jsonld,
            formatted_script_tag=formatted,
            entities_grounded=entities,
            faq_count=len(faq_pairs)
        )

