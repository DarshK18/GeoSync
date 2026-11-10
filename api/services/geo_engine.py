"""
geo_engine.py: Generative Engine Optimization (GEO) Evaluation Service for AiSeo
Evaluates web content for modern RAG context-window retention and AI search engine citation.
Returns strongly-typed Pydantic GeoScore models with AI qualitative insights.
"""

import json
import logging
import math
import os
import re
from typing import Any, Dict, List, Optional

from api.core.config import settings
from api.schemas.seo_models import (
    AIQualitativeInsight,
    CitationPrediction,
    DimensionScore,
    GeoScore,
    ScrapedContent
)

logger = logging.getLogger(__name__)

FLUFF_PATTERNS = [
    r"\bin today'?s (?:fast-paced|modern|digital)? (?:world|age|society|landscape)\b",
    r"\bhave you ever wondered\b",
    r"\blook no further\b",
    r"\bwithout further ado\b",
    r"\bin this (?:article|blog post|guide), we will (?:explore|dive|discuss)\b",
    r"\blet'?s dive (?:right )?in\b",
    r"\bas we all know\b",
    r"\bneedless to say\b",
    r"\bit goes without saying\b",
    r"\bat the end of the day\b",
    r"\ba wide variety of\b",
    r"\bwhen it comes to\b"
]

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
    "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
    "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
    "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
    "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these",
    "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
    "you're", "you've", "your", "yours", "yourself", "yourselves"
}

PRONOUNS = {
    "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "this", "that", "these", "those", "he", "him", "his", "she", "her", "hers"
}


class GEOEvaluationEngine:
    """Calculates quantitative RAG metrics and generates prioritized action items."""

    def __init__(self, scraped: ScrapedContent, target_entity: Optional[str] = None):
        self.scraped = scraped
        self.target_entity = target_entity or (scraped.title.split("-")[0].split("|")[0].strip() if scraped.title else "Primary Entity")
        self.words = [w.strip(".,!?:;\"'()[]{}") for w in scraped.main_text.split() if w.strip(".,!?:;\"'()[]{}")]
        self.words_lower = [w.lower() for w in self.words]

    def evaluate_bluf(self) -> DimensionScore:
        """Bottom Line Up Front (BLUF): evaluates immediate definitional clarity in opening 100 words."""
        score = 0.0
        recs = []
        metrics: Dict[str, Any] = {}
        first_100 = self.scraped.first_100_words.lower()
        sentences = [s.strip() for s in re.split(r"[.!?]+", self.scraped.first_100_words) if s.strip()]

        if sentences:
            lead_len = len(sentences[0].split())
            metrics["lead_sentence_words"] = lead_len
            if 12 <= lead_len <= 35:
                score += 35.0
            elif lead_len < 12:
                score += 20.0
                recs.append("Lead sentence is too brief to provide a complete standalone definition.")
            else:
                score += 15.0
                recs.append("Lead sentence is overly verbose (>35 words). Make your primary definition direct and concise.")
        else:
            recs.append("No clear opening sentence identified.")

        definitional_verbs = [" is a ", " is an ", " is the ", " refers to ", " defines ", " represents ", " provides ", " enables "]
        has_def = any(v in first_100 for v in definitional_verbs)
        metrics["has_definitional_predicate"] = has_def
        if has_def:
            score += 35.0
        else:
            recs.append(f"Missing explicit definition of '{self.target_entity}' in the first 100 words. Lead with '{self.target_entity} is...'")

        fluff_found = [p for p in FLUFF_PATTERNS if re.search(p, first_100, re.IGNORECASE)]
        metrics["lead_fluff_count"] = len(fluff_found)
        if not fluff_found:
            score += 30.0
        else:
            score += max(0.0, 30.0 - (len(fluff_found) * 15.0))
            recs.append("Eliminate opening conversational filler phrases ('In today's digital world'). Start directly with verified facts.")

        return DimensionScore(
            name="BLUF Direct Answer",
            score=round(min(100.0, max(0.0, score)), 2),
            weight=0.25,
            metrics=metrics,
            recommendations=recs
        )

    def evaluate_semantic_density(self) -> DimensionScore:
        """Measures non-stopword Type-Token Ratio and information-to-DOM ratio."""
        score = 0.0
        recs = []
        metrics: Dict[str, Any] = {}

        if not self.words_lower:
            return DimensionScore(name="Semantic Density", score=0.0, weight=0.20, recommendations=["No extractable text found."])

        content_words = [w for w in self.words_lower if w not in STOPWORDS and len(w) > 2]
        ttr = len(set(content_words)) / max(1, len(content_words))
        metrics["lexical_diversity_ttr"] = round(ttr, 4)

        if ttr >= 0.45:
            score += 40.0
        elif ttr >= 0.35:
            score += 25.0
            recs.append("Moderate lexical repetition. Expand technical vocabulary and domain-specific terminology.")
        else:
            score += 10.0
            recs.append("Low vocabulary diversity. Replace repetitive wording with dense semantic descriptors.")

        ratio = self.scraped.content_to_html_ratio
        metrics["content_to_html_ratio"] = ratio
        if ratio >= 0.15:
            score += 30.0
        elif ratio >= 0.08:
            score += 20.0
        else:
            score += 10.0
            recs.append("High HTML boilerplate-to-text ratio. Clean inline styles and script bloat to improve crawler throughput.")

        full_text_lower = self.scraped.main_text.lower()
        fluff_count = sum(len(re.findall(p, full_text_lower, re.IGNORECASE)) for p in FLUFF_PATTERNS)
        metrics["total_filler_phrases"] = fluff_count
        if fluff_count == 0:
            score += 30.0
        elif fluff_count <= 2:
            score += 20.0
        else:
            score += 5.0
            recs.append(f"Detected {fluff_count} generic filler phrases across the page. Remove conversational padding.")

        return DimensionScore(
            name="Semantic Density",
            score=round(min(100.0, max(0.0, score)), 2),
            weight=0.20,
            metrics=metrics,
            recommendations=recs
        )

    def evaluate_entity_clarity(self) -> DimensionScore:
        """Assesses entity salience and pronoun-to-noun ratio to prevent chunk anaphora loss."""
        score = 0.0
        recs = []
        metrics: Dict[str, Any] = {}

        pronoun_count = sum(1 for w in self.words_lower if w in PRONOUNS)
        content_word_count = sum(1 for w in self.words_lower if w not in STOPWORDS)
        pronoun_ratio = pronoun_count / max(1, content_word_count)
        metrics["pronoun_to_content_ratio"] = round(pronoun_ratio, 4)

        if pronoun_ratio <= 0.08:
            score += 40.0
        elif pronoun_ratio <= 0.15:
            score += 25.0
            recs.append("Moderate pronoun drift. Replace 'it' and 'they' with your explicit brand/technology name in key sections.")
        else:
            score += 10.0
            recs.append("Excessive relative pronouns. When RAG engines split text into 300-token chunks, pronoun context is severed.")

        entity_mentions = len(re.findall(re.escape(self.target_entity), self.scraped.main_text, re.IGNORECASE))
        metrics["target_entity_mentions"] = entity_mentions
        if entity_mentions >= 4:
            score += 35.0
        elif entity_mentions >= 1:
            score += 20.0
            recs.append(f"Target entity '{self.target_entity}' is only mentioned {entity_mentions} times. Re-anchor in subheadings.")
        else:
            recs.append(f"Target entity '{self.target_entity}' does not appear in the body content!")

        capitalized_entities = set(re.findall(r"\b[A-Z][a-z]{2,}\b", self.scraped.main_text))
        metrics["unique_named_entities"] = len(capitalized_entities)
        if len(capitalized_entities) >= 8:
            score += 25.0
        elif len(capitalized_entities) >= 3:
            score += 15.0
        else:
            recs.append("Low entity grounding. Cite industry standards, technologies, or formal organizational entities.")

        return DimensionScore(
            name="Entity Clarity & Prominence",
            score=round(min(100.0, max(0.0, score)), 2),
            weight=0.20,
            metrics=metrics,
            recommendations=recs
        )

    def evaluate_structure(self) -> DimensionScore:
        """Evaluates heading hierarchies, interrogative queries, and comparative tables."""
        score = 0.0
        recs = []
        metrics: Dict[str, Any] = {}

        has_h1 = len(self.scraped.h1_tags) > 0
        has_h2 = len(self.scraped.h2_tags) > 0
        metrics["h1_count"] = len(self.scraped.h1_tags)
        metrics["h2_count"] = len(self.scraped.h2_tags)

        if has_h1 and has_h2:
            score += 25.0
        elif has_h1 or has_h2:
            score += 15.0
            recs.append("Establish a clear heading hierarchy with a single H1 followed by multiple informative H2 sections.")
        else:
            recs.append("No H1/H2 tags detected. Heading structure is essential for semantic RAG chunking.")

        question_headings = [h for h in self.scraped.headings if h.is_question]
        metrics["question_headings_count"] = len(question_headings)
        if len(question_headings) >= 2:
            score += 25.0
        elif len(question_headings) == 1:
            score += 15.0
            recs.append("Add more interrogative headings (e.g. 'How Does X Work?', 'What are the Advantages of Y?').")
        else:
            recs.append("Zero interrogative headings. Reformat subheadings as direct natural language queries.")

        metrics["table_count"] = len(self.scraped.tables)
        if self.scraped.tables:
            score += 25.0
        else:
            recs.append("Add a comparative Markdown/HTML table. LLMs extract tokens from tables with highest priority.")

        metrics["list_item_count"] = self.scraped.list_item_count
        if self.scraped.list_item_count >= 4:
            score += 15.0
        elif self.scraped.list_item_count >= 1:
            score += 10.0
        else:
            recs.append("Use structured bulleted lists for technical specifications and multi-step workflows.")

        paragraphs = [p.strip() for p in self.scraped.main_text.split("\n\n") if len(p.strip()) > 30]
        if paragraphs:
            lengths = [len(p.split()) for p in paragraphs]
            avg_len = sum(lengths) / len(lengths)
            overlong = sum(1 for l in lengths if l > 120)
            metrics["avg_paragraph_words"] = round(avg_len, 1)
            metrics["overlong_paragraphs"] = overlong

            if overlong == 0 and 30 <= avg_len <= 85:
                score += 10.0
            elif overlong <= 2:
                score += 5.0
            else:
                recs.append(f"Split {overlong} long paragraphs into bite-sized 40-75 word chunks for optimal vector embeddings.")

        return DimensionScore(
            name="Structure & Tabular Synthesis",
            score=round(min(100.0, max(0.0, score)), 2),
            weight=0.20,
            metrics=metrics,
            recommendations=recs
        )

    def evaluate_schema(self) -> DimensionScore:
        """Assesses JSON-LD schema presence and entity graph completeness."""
        score = 0.0
        recs = []
        metrics: Dict[str, Any] = {}

        schemas = self.scraped.existing_schemas
        metrics["existing_schema_count"] = len(schemas)

        if not schemas:
            recs.append("No JSON-LD Schema detected. Implement TechArticle, Article, or FAQPage schema.")
            return DimensionScore(name="Schema Grounding", score=0.0, weight=0.15, metrics=metrics, recommendations=recs)

        score += 40.0
        has_entities = False
        detected_types = set()

        def inspect(node: dict):
            nonlocal has_entities
            t = node.get("@type", "")
            if isinstance(t, list):
                detected_types.update(t)
            elif t:
                detected_types.add(t)
            if "about" in node or "mentions" in node or "sameAs" in node:
                has_entities = True

        for s in schemas:
            if isinstance(s, dict):
                if "@graph" in s and isinstance(s["@graph"], list):
                    for n in s["@graph"]:
                        if isinstance(n, dict):
                            inspect(n)
                else:
                    inspect(s)

        metrics["detected_types"] = list(detected_types)
        metrics["has_entity_grounding"] = has_entities

        if detected_types.intersection({"Article", "TechArticle", "FAQPage", "HowTo", "NewsArticle"}):
            score += 30.0
        else:
            recs.append("Existing schema lacks high-value informational types (TechArticle, FAQPage).")

        if has_entities:
            score += 30.0
        else:
            recs.append("Enrich JSON-LD schema with canonical Wikidata URIs in 'about' and 'mentions' arrays.")

        return DimensionScore(
            name="Schema Grounding",
            score=round(min(100.0, max(0.0, score)), 2),
            weight=0.15,
            metrics=metrics,
            recommendations=recs
        )

    async def generate_ai_insight(self, overall_score: float) -> AIQualitativeInsight:
        """
        Synthesizes an executive qualitative assessment and suggested BLUF opening.
        Uses Gemini or OpenAI when keys are present, with deterministic fallback.
        """
        hook = f"**{self.target_entity}** is an authoritative technology engineered to provide low-latency contextual indexing and verified factual grounding."
        missing_ents = ["Vector Embeddings", "Cosine Similarity", "Approximate Nearest Neighbors", "Cross-Encoder Reranking"]

        # Deterministic assessment baseline
        if overall_score >= 85:
            assessment = f"The content exhibits superior factual co-location and heading anchoring. AI search models will index this page as a tier-1 primary source for queries targeting '{self.target_entity}'."
        elif overall_score >= 70:
            assessment = f"Strong contextual basis, but pronoun references and loose heading formatting increase the probability that competitor pages displace your chunks in Perplexity and SearchGPT."
        else:
            assessment = f"High risk of context window omission. The opening lacks a direct BLUF definition and the absence of structured comparison tables reduces token extraction probability."

        provider = "heuristic_engine"

        # Attempt Gemini inference if configured
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                # Try candidate models
                for m_name in ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-pro"]:
                    try:
                        m = genai.GenerativeModel(m_name)
                        prompt = (
                            f"Act as a Generative Engine Optimization (GEO) Architect.\n"
                            f"Analyze this content excerpt for entity '{self.target_entity}':\n"
                            f"{self.scraped.first_100_words}\n\n"
                            f"Provide JSON with keys:\n"
                            f"- assessment: 2-sentence summary of why AI models will or will not cite this source\n"
                            f"- missing_entities: 3-4 key technical concepts related to this topic\n"
                            f"- suggested_hook: a single 30-word definitive definition starting with '**{self.target_entity}** is...'"
                        )
                        resp = m.generate_content(prompt)
                        raw = resp.text.strip()
                        raw = re.sub(r"^```(?:json)?\s*", "", raw)
                        raw = re.sub(r"\s*```$", "", raw)
                        parsed = json.loads(raw)
                        assessment = parsed.get("assessment", assessment)
                        missing_ents = parsed.get("missing_entities", missing_ents)
                        hook = parsed.get("suggested_hook", hook)
                        provider = "gemini"
                        break
                    except Exception:
                        continue
            except Exception as e:
                logger.debug(f"Gemini insight generation skipped: {e}")

        return AIQualitativeInsight(
            executive_assessment=assessment,
            missing_latent_entities=missing_ents,
            suggested_bluf_hook=hook,
            provider_used=provider
        )

    async def compute_score(self) -> GeoScore:
        bluf = self.evaluate_bluf()
        density = self.evaluate_semantic_density()
        entity = self.evaluate_entity_clarity()
        structure = self.evaluate_structure()
        schema = self.evaluate_schema()

        overall = (
            (bluf.score * bluf.weight) +
            (density.score * density.weight) +
            (entity.score * entity.weight) +
            (structure.score * structure.weight) +
            (schema.score * schema.weight)
        )
        overall = round(min(100.0, max(0.0, overall)), 1)

        if overall >= 90:
            grade = "A+"
            tier = "High"
            prob = 0.90
        elif overall >= 80:
            grade = "A"
            tier = "High"
            prob = 0.80
        elif overall >= 70:
            grade = "B"
            tier = "Medium"
            prob = 0.60
        elif overall >= 55:
            grade = "C"
            tier = "Low"
            prob = 0.35
        else:
            grade = "F"
            tier = "Unlikely"
            prob = 0.10

        strengths = []
        vulnerabilities = []

        if bluf.score >= 80:
            strengths.append("Direct answer is prominent and quickly accessible within the first 100 words.")
        else:
            vulnerabilities.append("Delayed lead definition: AI crawlers may prune the introductory chunk before reaching the core answer.")

        if structure.score >= 80:
            strengths.append("High structural RAG suitability with interrogative headings and modular sections.")
        else:
            vulnerabilities.append("Sub-optimal section structuring; lacks interrogative queries and comparative tables.")

        if schema.score >= 70:
            strengths.append("JSON-LD schema provides machine-readable grounding.")
        else:
            vulnerabilities.append("Missing or incomplete JSON-LD semantic graph.")

        all_recs = []
        for dim in [bluf, structure, schema, density, entity]:
            all_recs.extend(dim.recommendations)

        citation_pred = CitationPrediction(
            tier=tier,
            primary_citation_probability=prob,
            top_strengths=strengths,
            critical_vulnerabilities=vulnerabilities
        )

        ai_insight = await self.generate_ai_insight(overall)

        return GeoScore(
            overall_score=overall,
            grade=grade,
            citation_prediction=citation_pred,
            dimensions={
                "bluf": bluf,
                "density": density,
                "entity": entity,
                "structure": structure,
                "schema": schema
            },
            actionable_checklist=all_recs,
            ai_enhanced=ai_insight.provider_used != "heuristic_engine",
            ai_insight=ai_insight
        )

