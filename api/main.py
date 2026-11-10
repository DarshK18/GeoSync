"""
api/main.py: Production Vercel Serverless Entry Point for AIO & GEO Platform
Exposes POST /api/analyze-geo powered by LangGraph analysis pipelines.
Handles strict CORS for Vercel and localhost development.
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Any, Dict

# Ensure root workspace and api directory are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
for p in (CURRENT_DIR, PARENT_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.aio_engine.pipeline import run_aio_pipeline
from api.core.config import settings
from api.schemas.aio_models import GeoAnalysisRequest, GeoAnalysisResponse

# Maintain backward compatibility with previous models if needed
from api.schemas.seo_models import (
    AnalysisRequest,
    FullAnalysisResponse
)
from api.services.scraper import AsyncWebScraper
from api.services.geo_engine import GEOEvaluationEngine
from api.services.schema_builder import SchemaGraphBuilder
from api.services.content_transformer import transform_content_for_rag
from api.services.simulator import RAGCitationSimulator
from api.services.crawler_configs import generate_crawler_configurations

logging.basicConfig(
    level=settings.LOG_LEVEL.upper(),
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("aio_geo_platform")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AIO & GEO Enterprise Platform...")
    yield
    logger.info("Shutting down AIO & GEO Platform.")


app = FastAPI(
    title="AIO & GEO Enterprise Platform",
    version="2.0.0",
    description="Dedicated Artificial Intelligence Optimization (AIO) and Generative Engine Optimization (GEO) Engine. Powered by LangGraph & FastAPI.",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Vercel & Development CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits Vercel edge domains, previews, and localhost:3000
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# --- Core System Endpoints ---

@app.get("/", tags=["System"])
@app.get("/api", tags=["System"])
async def root():
    return {
        "status": "online",
        "service": "AIO & GEO Platform Serverless Engine",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "analyze_geo": "POST /api/analyze-geo",
            "health": "GET /api/health"
        }
    }


@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
@app.get("/api/v1/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AIO & GEO Platform",
        "version": "2.0.0",
        "runtime": "Vercel Serverless / Python 3.12+"
    }


# --- Primary AIO / GEO LangGraph Endpoint ---

@app.post(
    "/analyze-geo",
    response_model=GeoAnalysisResponse,
    status_code=status.HTTP_200_OK,
    tags=["AIO & GEO"],
    summary="Evaluate RAG-Readiness & Synthesize Generative Snippets"
)
@app.post("/api/analyze-geo", response_model=GeoAnalysisResponse, include_in_schema=False)
@app.post("/api/v1/analyze-geo", response_model=GeoAnalysisResponse, include_in_schema=False)
async def analyze_geo_endpoint(payload: GeoAnalysisRequest) -> GeoAnalysisResponse:
    """
    Executes the 5-node LangGraph pipeline:
    1. Asynchronous DOM scraping with rotating user-agents and bot resilience.
    2. Knowledge Graph entity extraction and Wikidata URI resolution.
    3. 3-Dimensional AIO evaluation (Direct Answer Density, Semantic Entity Saturation, Information Gain).
    4. Generative snippet recommendations and side-by-side rewritten text synthesis.
    5. Interconnected Schema.org JSON-LD @graph and AI crawler directives.
    """
    logger.info(f"Initiating AIO LangGraph analysis for: {payload.url}")

    try:
        response: GeoAnalysisResponse = await run_aio_pipeline(
            url=payload.url,
            target_entity=payload.target_entity,
            timeout_seconds=payload.timeout_seconds or 15
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except TimeoutError as te:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Scraper timed out: {str(te)}. Site took too long to respond."
        )
    except Exception as exc:
        logger.error(f"AIO Pipeline error for {payload.url}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AIO Pipeline execution error: {str(exc)}"
        )


# Backward-compatible legacy endpoints for existing dashboard clients
@app.post("/api/analyze", include_in_schema=False)
@app.post("/analyze", include_in_schema=False)
async def legacy_analyze(payload: AnalysisRequest):
    # Route through the enhanced AIO pipeline and adapt
    geo_res = await run_aio_pipeline(
        url=payload.url,
        target_entity=payload.target_entity,
        timeout_seconds=payload.timeout_seconds or 15
    )
    # Return in geo_res format which contains all required telemetry
    return geo_res


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
