"""
scraper.py: Production-Grade Asynchronous Web Scraper for Serverless Vercel Environment
Features rotating User-Agents, error handling for blocked requests (403/429),
timeout limits, fallback HTML parsers, and clean text/hierarchy/table/schema extraction.
"""

import json
import logging
import random
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup, Tag
import httpx

from api.core.config import settings
from api.schemas.seo_models import HeadingItem, ScrapedContent, TableRecord

logger = logging.getLogger(__name__)

USER_AGENT_POOL: List[str] = [
    # Modern Chrome Windows
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    # Modern Chrome Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    # Safari Mac
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    # Googlebot Smartphone (for mobile RAG view)
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    # Perplexity AI Bot
    "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    # ClaudeBot
    "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/claudebot)"
]


def is_interrogative_heading(text: str) -> bool:
    """Classifies whether a heading functions as an interrogative search query."""
    t = text.strip().lower()
    if t.endswith("?"):
        return True
    starters = (
        "what", "how", "why", "when", "where", "who", "which",
        "can", "does", "is", "are", "should", "will", "do", "best", "top", "versus", "vs"
    )
    return any(t.startswith(s + " ") for s in starters)


def parse_html_table(table_tag: Tag) -> TableRecord:
    """Extracts column headers, row records, and synthesizes Markdown table notation."""
    headers: List[str] = []
    rows: List[List[str]] = []

    # Extract headers
    thead = table_tag.find("thead")
    if thead:
        cells = thead.find_all(["th", "td"])
        headers = [re.sub(r"\s+", " ", c.get_text()).strip() for c in cells]
    else:
        first_tr = table_tag.find("tr")
        if first_tr:
            th_cells = first_tr.find_all("th")
            if th_cells:
                headers = [re.sub(r"\s+", " ", c.get_text()).strip() for c in th_cells]

    # Extract body rows
    tbody = table_tag.find("tbody") or table_tag
    for tr in tbody.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        row_vals = [re.sub(r"\s+", " ", c.get_text()).strip() for c in cells]
        if row_vals and row_vals != headers:
            rows.append(row_vals)

    # Build Markdown table string
    md_lines: List[str] = []
    if headers:
        md_lines.append("| " + " | ".join(headers) + " |")
        md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
    elif rows:
        col_count = max(len(r) for r in rows)
        headers = [f"Col {i+1}" for i in range(col_count)]
        md_lines.append("| " + " | ".join(headers) + " |")
        md_lines.append("| " + " | ".join(["---"] * col_count) + " |")

    for r in rows:
        padded = r + [""] * (len(headers) - len(r))
        md_lines.append("| " + " | ".join(padded[:len(headers)]) + " |")

    return TableRecord(
        headers=headers,
        rows=rows,
        markdown_representation="\n".join(md_lines)
    )


class AsyncWebScraper:
    """
    Enterprise asynchronous scraper optimized for Vercel Serverless.
    Includes rotating User-Agents, timeout controls, and multi-parser fallback.
    """

    def __init__(self, timeout_seconds: Optional[int] = None):
        self.timeout = timeout_seconds or settings.DEFAULT_TIMEOUT_SECONDS

    def _get_request_headers(self) -> Dict[str, str]:
        selected_ua = random.choice(USER_AGENT_POOL)
        return {
            "User-Agent": selected_ua,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site"
        }

    async def scrape(self, url: str) -> ScrapedContent:
        """
        Fetches the target URL asynchronously, prunes DOM noise,
        extracts structural headings, tables, schemas, and word statistics.
        """
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(f"Invalid URL format: '{url}'. Must include http:// or https://")

        headers = self._get_request_headers()

        async with httpx.AsyncClient(
            timeout=self.timeout,
            follow_redirects=True,
            headers=headers,
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        ) as client:
            try:
                response = await client.get(url)
                if response.status_code in (401, 403):
                    # Attempt one retry with PerplexityBot UA if blocked
                    logger.warning(f"HTTP {response.status_code} received. Retrying with AI Crawler signature...")
                    headers["User-Agent"] = "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)"
                    response = await client.get(url, headers=headers)

                response.raise_for_status()
                # Limit size to protect serverless memory
                raw_html = response.text[:settings.MAX_SCRAPE_BYTES]
                status_code = response.status_code
            except httpx.TimeoutException as exc:
                logger.error(f"Timeout fetching {url}: {exc}")
                raise TimeoutError(f"Scraper timed out after {self.timeout}s fetching {url}. Serverless limit reached.") from exc
            except httpx.HTTPStatusError as exc:
                code = exc.response.status_code
                if code in (403, 401):
                    raise RuntimeError(f"Target site blocked automated requests (HTTP {code} Forbidden/Unauthorized).") from exc
                if code == 429:
                    raise RuntimeError(f"Target site rate-limited automated access (HTTP 429 Too Many Requests).") from exc
                raise RuntimeError(f"Server returned HTTP {code}: {exc.response.reason_phrase}") from exc
            except httpx.RequestError as exc:
                logger.error(f"Network request error fetching {url}: {exc}")
                raise RuntimeError(f"Network error communicating with target server: {str(exc)}") from exc

        raw_html_len = len(raw_html)

        # Fallback parser selection: try lxml, fall back to html.parser
        try:
            soup = BeautifulSoup(raw_html, "lxml")
        except Exception:
            soup = BeautifulSoup(raw_html, "html.parser")

        # 1. Meta extraction
        title_tag = soup.find("title")
        title = re.sub(r"\s+", " ", title_tag.get_text()).strip() if title_tag else ""

        meta_desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)}) or \
                        soup.find("meta", attrs={"property": "og:description"})
        meta_desc = meta_desc_tag.get("content", "").strip() if meta_desc_tag and meta_desc_tag.get("content") else ""

        canonical_tag = soup.find("link", rel=re.compile(r"^canonical$", re.I))
        canonical_url = canonical_tag.get("href", "").strip() if canonical_tag and canonical_tag.get("href") else None
        if canonical_url and not canonical_url.startswith("http"):
            canonical_url = urljoin(url, canonical_url)

        # 2. Extract existing JSON-LD schemas before decomposing scripts
        existing_schemas: List[Dict[str, Any]] = []
        for script in soup.find_all("script", type="application/ld+json"):
            if script.string:
                try:
                    cleaned_json = re.sub(r"[\r\n\t]+", " ", script.string.strip())
                    data = json.loads(cleaned_json)
                    existing_schemas.append(data)
                except Exception:
                    continue

        # 3. Extract Tables
        extracted_tables: List[TableRecord] = []
        for tbl in soup.find_all("table"):
            table_rec = parse_html_table(tbl)
            if table_rec.rows:
                extracted_tables.append(table_rec)

        # 4. Count List Items
        list_item_count = len(soup.find_all("li"))

        # 5. Extract Full Heading Hierarchy (H1 - H6)
        headings: List[HeadingItem] = []
        h1_list: List[str] = []
        h2_list: List[str] = []
        h3_list: List[str] = []

        for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
            text = re.sub(r"\s+", " ", h.get_text()).strip()
            if not text:
                continue
            level = h.name.lower()
            is_q = is_interrogative_heading(text)
            headings.append(HeadingItem(level=level, text=text, is_question=is_q))

            if level == "h1":
                h1_list.append(text)
            elif level == "h2":
                h2_list.append(text)
            elif level == "h3":
                h3_list.append(text)

        # 6. DOM Noise Pruning: remove boilerplate that degrades vector chunking
        boilerplate_selectors = [
            "script", "style", "nav", "footer", "header", "aside", "noscript",
            "svg", "iframe", "form", ".nav", ".navbar", ".menu", ".sidebar",
            ".footer", ".ad", ".ads", ".advertisement", ".cookie-banner",
            ".popup", ".modal", "#sidebar", "#footer", "#navigation"
        ]
        for sel in boilerplate_selectors:
            for elem in soup.select(sel):
                elem.decompose()

        # Find primary content container
        content_container = (
            soup.find("main") or
            soup.find("article") or
            soup.find(id=re.compile(r"content|main|article|body", re.I)) or
            soup.find(class_=re.compile(r"content|main|article|body", re.I)) or
            soup.body or
            soup
        )

        content_chunks: List[str] = []
        for tag in content_container.find_all(["p", "h1", "h2", "h3", "h4", "li", "blockquote"]):
            txt = re.sub(r"\s+", " ", tag.get_text()).strip()
            if txt and len(txt) > 20:
                content_chunks.append(txt)

        main_text = "\n\n".join(content_chunks)
        if not main_text:
            main_text = re.sub(r"\s+", " ", content_container.get_text()).strip()

        words = main_text.split()
        word_count = len(words)
        first_100 = " ".join(words[:100]) if words else ""
        reading_time = round(word_count / 200.0, 2)
        content_ratio = round((len(main_text) / max(1, raw_html_len)), 4)

        return ScrapedContent(
            url=url,
            status_code=status_code,
            title=title,
            meta_description=meta_desc,
            canonical_url=canonical_url,
            headings=headings,
            h1_tags=h1_list,
            h2_tags=h2_list,
            h3_tags=h3_list,
            main_text=main_text,
            first_100_words=first_100,
            word_count=word_count,
            reading_time_minutes=reading_time,
            tables=extracted_tables,
            existing_schemas=existing_schemas,
            content_to_html_ratio=content_ratio,
            list_item_count=list_item_count
        )
