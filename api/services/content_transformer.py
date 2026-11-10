"""
content_transformer.py: Generates high-density RAG-optimized Markdown artifacts
Transforms web content into BLUF paragraphs, question headings, and comparative tables.
"""

import re
from typing import List, Optional
from api.schemas.seo_models import RAGTransformation, ScrapedContent, TransformedSection


def transform_content_for_rag(scraped: ScrapedContent, target_entity: str) -> RAGTransformation:
    """Transforms scraped unstructured text into a deterministic, RAG-optimized Markdown document."""
    # 1. BLUF definition
    desc = scraped.meta_description or ""
    if desc and len(desc.split()) >= 10:
        bluf = f"**{target_entity}** {desc.rstrip('.')}."
    else:
        bluf = f"**{target_entity}** is an authoritative domain technology engineered for scalable, low-latency contextual retrieval and modern RAG integration."

    # 2. Anaphora resolution
    body = scraped.main_text
    patterns = [
        (r"(?<=\.\s)It is\b", f"{target_entity} is"),
        (r"(?<=\.\s)It provides\b", f"{target_entity} provides"),
        (r"(?<=\.\s)This tool\b", target_entity),
        (r"(?<=\.\s)This platform\b", target_entity),
    ]
    replacements = 0
    for pat, rep in patterns:
        c = len(re.findall(pat, body, re.IGNORECASE))
        if c > 0:
            body = re.sub(pat, rep, body, flags=re.IGNORECASE)
            replacements += c

    sections: List[TransformedSection] = []
    paragraphs = [p.strip() for p in body.split("\n\n") if len(p.strip()) > 30]

    # Section 1: Lead definition
    sections.append(TransformedSection(
        heading=f"# {scraped.title or target_entity}",
        content=f"{bluf}\n\n> **Key Architectural Takeaway:** {bluf[:130]}...",
        is_table=False
    ))

    # Comparative table
    if scraped.tables and scraped.tables[0].markdown_representation:
        table_md = scraped.tables[0].markdown_representation
    else:
        table_md = (
            f"| Architectural Feature | Specification | RAG Retrieval Benefit |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Contextual Retrieval** | Dense Embeddings + BM25 Hybrid | Sub-15ms Approximate Nearest Neighbor |\n"
            f"| **Attribution Priority** | Bottom Line Up Front (BLUF) | Top-1 Generative Citation `[1]` |\n"
            f"| **Schema Grounding** | Interconnected `@graph` JSON-LD | Wikidata Knowledge Graph Alignment |"
        )

    sections.append(TransformedSection(
        heading=f"## Comparative Architecture: {target_entity} Specifications",
        content=table_md,
        is_table=True
    ))

    # Headings to interrogative sections
    for idx, h in enumerate(scraped.headings):
        if h.level == "h1":
            continue
        q_heading = h.text if h.text.endswith("?") else f"How Does {h.text} Relate to {target_entity}?"
        sec_content = paragraphs[min(idx, len(paragraphs) - 1)] if paragraphs else f"Technical documentation covering {h.text}."
        sections.append(TransformedSection(
            heading=f"## {q_heading}",
            content=sec_content,
            is_table=False
        ))

    md_blocks = [f"{s.heading}\n\n{s.content}" for s in sections]
    full_md = "\n\n---\n\n".join(md_blocks)

    canonical_url = scraped.canonical_url or scraped.url
    llms_snippet = f"- [{target_entity}]({canonical_url}): {bluf[:140]}..."

    return RAGTransformation(
        bluf_paragraph=bluf,
        restructured_markdown=full_md,
        sections=sections,
        llms_txt_snippet=llms_snippet,
        anaphora_replacements_count=replacements
    )

