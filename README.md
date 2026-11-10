# Enterprise AI SEO (Generative Engine Optimization - GEO) Platform

An enterprise-grade, full-stack **AI SEO / Generative Engine Optimization (GEO)** platform with end-to-end type safety, inspired by platforms like `typesafe.ai`. 

Engineered to reverse-engineer how modern RAG (Retrieval-Augmented Generation) search engines (**ChatGPT / SearchGPT, Perplexity AI, Google Gemini, and Claude**) index, score, and select context window data to cite your website as the **#1 primary source (`[1]`)**.

---

## 🏛️ System Architecture

```text
Ai Seo/
├── backend/                  # High-performance FastAPI backend (Python 3.12+, uv)
│   ├── app/
│   │   ├── api/v1/router.py  # REST API endpoints (POST /api/v1/analyze, GET /api/v1/health)
│   │   ├── core/config.py    # Type-safe Pydantic Settings & CORS configuration
│   │   ├── schemas/          # Strict Pydantic models (AnalysisRequest, GeoScore, ScrapedContent)
│   │   ├── services/
│   │   │   ├── scraper.py    # Asynchronous HTTPX DOM noise-purging scraper
│   │   │   ├── geo_engine.py # 5-Dimensional RAG-Readiness Scoring Engine
│   │   │   ├── schema_builder.py # Schema.org JSON-LD @graph Knowledge Graph builder
│   │   │   └── content_transformer.py # BLUF & Markdown restructuring engine
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Comprehensive backend test suite
│   ├── .env                  # Backend environment configuration
│   └── main.py               # Local runner
├── frontend/                 # Sleek Next.js 14+ App Router client (TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/              # Layout, landing page, and globals.css
│   │   ├── components/       # UrlAnalyzer.tsx, GeoReport.tsx, Header.tsx
│   │   ├── lib/api.ts        # Strongly-typed fetch client for FastAPI
│   │   └── types/seo.ts      # TypeScript interfaces mirroring backend Pydantic models
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.mjs
├── shared_contracts/
│   └── openapi.json          # Machine-readable OpenAPI contract
├── run_dev.py                # Dual-process orchestrator (starts Backend & Frontend together)
└── pyproject.toml            # Root uv dependency configuration
```

---

## ⚡ How to Run

### Option 1: Run Both Backend & Frontend Simultaneously (Recommended)

From the project root directory, run:

```bash
uv run python run_dev.py
```

This concurrently boots:
* **Frontend (Next.js Dashboard)**: 👉 **[http://localhost:3000](http://localhost:3000)**
* **Backend (FastAPI Engine)**: 👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
* **Interactive OpenAPI Docs**: 👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

### Option 2: Run Backend & Frontend in Separate Terminals

#### Terminal 1 — Backend (FastAPI):
```bash
uv run uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Frontend (Next.js):
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 Strict REST API Contract: `POST /api/v1/analyze`

### Request Body (`AnalysisRequest`)
```json
{
  "url": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
  "target_entity": "Retrieval-Augmented Generation",
  "timeout_seconds": 20
}
```

### Response Payload (`FullAnalysisResponse`)
```json
{
  "request_url": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
  "target_entity": "Retrieval-Augmented Generation",
  "scraped_summary": {
    "title": "Retrieval-augmented generation - Wikipedia",
    "word_count": 1420,
    "reading_time_minutes": 7.1,
    "h1_count": 1,
    "h2_count": 6,
    "table_count": 1,
    "content_to_html_ratio": 0.22
  },
  "geo_score": {
    "overall_score": 93.5,
    "grade": "A+",
    "citation_prediction": {
      "tier": "High",
      "primary_citation_probability": 0.90,
      "top_strengths": [
        "Direct answer is prominent and quickly accessible within the first 100 words.",
        "High structural RAG suitability with interrogative headings and modular sections."
      ],
      "critical_vulnerabilities": []
    },
    "dimensions": {
      "bluf": {
        "name": "BLUF Direct Answer",
        "score": 95.0,
        "weight": 0.25
      },
      "density": {
        "name": "Semantic Density",
        "score": 90.0,
        "weight": 0.20
      },
      "entity": {
        "name": "Entity Clarity & Prominence",
        "score": 90.0,
        "weight": 0.20
      },
      "structure": {
        "name": "Structure & Tabular Synthesis",
        "score": 95.0,
        "weight": 0.20
      },
      "schema": {
        "name": "Schema Grounding",
        "score": 100.0,
        "weight": 0.15
      }
    },
    "actionable_checklist": [
      "Enrich JSON-LD schema with canonical Wikidata URIs in 'about' and 'mentions' arrays."
    ]
  },
  "schema_recommendations": {
    "schema_type": "TechArticle+Graph",
    "formatted_script_tag": "<script type=\"application/ld+json\">...</script>",
    "entities_grounded": [
      {
        "name": "Retrieval-Augmented Generation",
        "wikidata_url": "https://www.wikidata.org/wiki/Q124334346",
        "relevance_type": "about"
      }
    ],
    "faq_count": 3
  },
  "transformation": {
    "bluf_paragraph": "Retrieval-Augmented Generation is an authoritative architecture designed for low-latency contextual retrieval...",
    "restructured_markdown": "# Retrieval-augmented generation\n\n...",
    "llms_txt_snippet": "- [Retrieval-Augmented Generation](https://...): Authoritative architecture..."
  }
}
```

---

## 🧪 Running Automated Tests

Run the backend verification suite:
```bash
uv run python backend/tests/test_backend.py
```
*(All 4 test suites pass: Scraper classification, GEO Engine BLUF evaluation, Schema.org Builder, and Content Transformation).*
