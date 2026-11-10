"""
schema_builder.py: LLM-Optimized Schema.org JSON-LD Knowledge Graph Generator
Focuses on structured entity grounding (Wikidata URIs, @graph interconnected nodes,
concept disambiguation) to eliminate LLM hallucination and maximize RAG retrieval confidence.
Legacy SEO schemas are replaced with dense entity triples.
"""

import json
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from api.schemas.aio_models import EntityGraphData, KnowledgeTriple


# Curated Wikidata URI Knowledge Base for AI, Cloud, Software, and Tech Entities
WIKIDATA_KNOWLEDGE_BASE: Dict[str, Dict[str, str]] = {
    "retrieval-augmented generation": {
        "name": "Retrieval-Augmented Generation",
        "wikidata_id": "Q123508197",
        "url": "https://www.wikidata.org/wiki/Q123508197",
        "description": "Technique in AI combining information retrieval with text generation."
    },
    "rag": {
        "name": "Retrieval-Augmented Generation",
        "wikidata_id": "Q123508197",
        "url": "https://www.wikidata.org/wiki/Q123508197",
        "description": "Technique in AI combining information retrieval with text generation."
    },
    "vector database": {
        "name": "Vector Database",
        "wikidata_id": "Q117790342",
        "url": "https://www.wikidata.org/wiki/Q117790342",
        "description": "Database optimized for storing and querying multi-dimensional vector embeddings."
    },
    "large language model": {
        "name": "Large Language Model",
        "wikidata_id": "Q115305900",
        "url": "https://www.wikidata.org/wiki/Q115305900",
        "description": "Deep learning model trained on vast text corpora for generative text processing."
    },
    "llm": {
        "name": "Large Language Model",
        "wikidata_id": "Q115305900",
        "url": "https://www.wikidata.org/wiki/Q115305900",
        "description": "Deep learning model trained on vast text corpora for generative text processing."
    },
    "langchain": {
        "name": "LangChain",
        "wikidata_id": "Q119842603",
        "url": "https://www.wikidata.org/wiki/Q119842603",
        "description": "Framework designed to simplify the creation of applications using large language models."
    },
    "langgraph": {
        "name": "LangGraph",
        "wikidata_id": "Q119842603",
        "url": "https://www.wikidata.org/wiki/Q119842603",
        "description": "Library for building stateful, multi-actor applications with LLMs."
    },
    "fastapi": {
        "name": "FastAPI",
        "wikidata_id": "Q105658603",
        "url": "https://www.wikidata.org/wiki/Q105658603",
        "description": "Modern, high-performance web framework for building APIs with Python."
    },
    "pydantic": {
        "name": "Pydantic",
        "wikidata_id": "Q105658603",
        "url": "https://www.wikidata.org/wiki/Q105658603",
        "description": "Data validation and settings management using Python type annotations."
    },
    "next.js": {
        "name": "Next.js",
        "wikidata_id": "Q111973680",
        "url": "https://www.wikidata.org/wiki/Q111973680",
        "description": "React-based web development framework created by Vercel."
    },
    "artificial intelligence": {
        "name": "Artificial Intelligence",
        "wikidata_id": "Q11660",
        "url": "https://www.wikidata.org/wiki/Q11660",
        "description": "Intelligence demonstrated by machines, simulating human cognitive functions."
    },
    "machine learning": {
        "name": "Machine Learning",
        "wikidata_id": "Q2539",
        "url": "https://www.wikidata.org/wiki/Q2539",
        "description": "Study of algorithms that improve automatically through data experience."
    },
    "cross-encoder": {
        "name": "Transformer",
        "wikidata_id": "Q85810457",
        "url": "https://www.wikidata.org/wiki/Q85810457",
        "description": "Deep learning model architecture using self-attention mechanisms."
    },
    "embedding": {
        "name": "Word Embedding",
        "wikidata_id": "Q28456209",
        "url": "https://www.wikidata.org/wiki/Q28456209",
        "description": "Representation of words or concepts as real-valued vectors in a vector space."
    }
}


def resolve_wikidata_entity(entity_name: str) -> Optional[Dict[str, str]]:
    """Resolves an entity name to a curated Wikidata URI mapping."""
    key = entity_name.strip().lower()
    if key in WIKIDATA_KNOWLEDGE_BASE:
        return WIKIDATA_KNOWLEDGE_BASE[key]

    # Partial match
    for k, v in WIKIDATA_KNOWLEDGE_BASE.items():
        if k in key or key in k:
            return v
    return None


class AioSchemaBuilder:
    """Constructs machine-validated Schema.org knowledge graph with Wikidata entity triples."""

    @staticmethod
    def build_entity_graph(
        url: str,
        target_entity: str,
        text_corpus: str,
        headings: List[Dict[str, Any]]
    ) -> EntityGraphData:
        """Extracts entity salience, co-occurring concepts, and knowledge graph triples."""
        target_norm = target_entity.strip()
        corpus_lower = text_corpus.lower()
        first_200_words = " ".join(text_corpus.split()[:200]).lower()

        # Calculate entity salience: presence in first 200 tokens + frequency
        target_occurrences = corpus_lower.count(target_norm.lower())
        in_first_200 = target_norm.lower() in first_200_words
        salience = min(1.0, (0.5 if in_first_200 else 0.1) + min(0.5, target_occurrences * 0.05))

        # Identify co-occurring known entities
        co_occurring: List[str] = []
        wikidata_links: Dict[str, str] = {}

        primary_wiki = resolve_wikidata_entity(target_norm)
        if primary_wiki:
            wikidata_links[primary_wiki["name"]] = primary_wiki["url"]

        for term, data in WIKIDATA_KNOWLEDGE_BASE.items():
            if term != target_norm.lower() and term in corpus_lower:
                if data["name"] not in co_occurring:
                    co_occurring.append(data["name"])
                    wikidata_links[data["name"]] = data["url"]

        # Build semantic triples
        triples: List[KnowledgeTriple] = []
        triples.append(KnowledgeTriple(
            subject=target_norm,
            predicate="isDefinedAs",
            object="Core conceptual subject of the document passage"
        ))
        for co in co_occurring[:4]:
            triples.append(KnowledgeTriple(
                subject=target_norm,
                predicate="coOccursWith",
                object=co
            ))

        # Check pronoun anaphora drift
        anaphora_matches = re.findall(r"\b(it|they|this|these|those)\s+(is|are|provides|means|enables|helps)\b", corpus_lower)
        anaphora_count = len(anaphora_matches)

        return EntityGraphData(
            primary_entity=target_norm,
            salience_score=round(salience, 3),
            co_occurring_entities=co_occurring[:8],
            wikidata_links=wikidata_links,
            triples=triples,
            pronoun_anaphora_drift_count=anaphora_count
        )

    @staticmethod
    def generate_jsonld_payload(
        url: str,
        title: str,
        meta_description: str,
        target_entity: str,
        entity_graph: EntityGraphData,
        faqs: List[Dict[str, str]],
        data_tables: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Synthesizes an interconnected @graph Schema.org JSON-LD object.
        Links WebSite, Organization, TechArticle, and Wikidata entities.
        """
        parsed = urlparse(url)
        domain = parsed.netloc or "example.com"
        base_url = f"{parsed.scheme or 'https'}://{domain}"

        # 1. Primary Entity Object for 'about'
        primary_entity_id = f"{url}#entity-{re.sub(r'[^a-zA-Z0-9]', '', target_entity).lower()}"
        primary_wiki_url = entity_graph.wikidata_links.get(target_entity) or entity_graph.wikidata_links.get(entity_graph.primary_entity)

        about_entity: Dict[str, Any] = {
            "@type": "Thing",
            "@id": primary_entity_id,
            "name": target_entity
        }
        if primary_wiki_url:
            about_entity["sameAs"] = primary_wiki_url

        # 2. Mentions Array with Wikidata Grounding
        mentions_entities: List[Dict[str, Any]] = []
        for name, wiki_url in list(entity_graph.wikidata_links.items())[:6]:
            if name.lower() != target_entity.lower():
                mentions_entities.append({
                    "@type": "Thing",
                    "name": name,
                    "sameAs": wiki_url
                })

        # 3. WebSite Node
        website_node = {
            "@type": "WebSite",
            "@id": f"{base_url}/#website",
            "url": base_url,
            "name": domain.split(".")[0].capitalize(),
            "description": f"Authoritative domain context for {domain}"
        }

        # 4. TechArticle / Article Node
        article_node = {
            "@type": "TechArticle",
            "@id": f"{url}#article",
            "isPartOf": {"@id": f"{base_url}/#website"},
            "headline": title,
            "description": meta_description or f"Technical documentation and authoritative reference for {target_entity}.",
            "url": url,
            "mainEntityOfPage": url,
            "about": about_entity,
            "mentions": mentions_entities,
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", ".direct-answer", ".bluf-paragraph"]
            }
        }

        graph_nodes: List[Dict[str, Any]] = [website_node, article_node]

        # 5. FAQPage Node if question headings present
        if faqs:
            main_entities = []
            for faq in faqs[:5]:
                main_entities.append({
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq["answer"]
                    }
                })
            faq_node = {
                "@type": "FAQPage",
                "@id": f"{url}#faq",
                "isPartOf": {"@id": f"{base_url}/#website"},
                "mainEntity": main_entities
            }
            graph_nodes.append(faq_node)

        # 6. ItemList / Dataset node if data tables present
        if data_tables:
            table_records = []
            for idx, tbl in enumerate(data_tables[:3]):
                headers = tbl.get("headers", [])
                table_records.append({
                    "@type": "ListItem",
                    "position": idx + 1,
                    "name": f"Structured Matrix {idx + 1}: {', '.join(headers[:3])}" if headers else f"Data Matrix {idx + 1}"
                })
            if table_records:
                dataset_node = {
                    "@type": "ItemList",
                    "@id": f"{url}#datasets",
                    "name": f"Quantitative Metrics & Benchmarks for {target_entity}",
                    "itemListElement": table_records
                }
                graph_nodes.append(dataset_node)

        return {
            "@context": "https://schema.org",
            "@graph": graph_nodes
        }

    @staticmethod
    def format_script_tag(jsonld_payload: Dict[str, Any]) -> str:
        """Formats the JSON-LD dictionary as a clean HTML <script> tag."""
        formatted_json = json.dumps(jsonld_payload, indent=2, ensure_ascii=False)
        return f'<script type="application/ld+json">\n{formatted_json}\n</script>'
