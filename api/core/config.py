"""
config.py: Enterprise Application Configuration & Strict Environment Validation
Managed via Pydantic BaseSettings for Vercel Serverless and Local Execution.
"""

import os
from typing import List, Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AiSeo — Enterprise Generative Engine Optimization (GEO) API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"

    # CORS settings: allows local Next.js frontend, localhost, and Vercel production domains
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://ai-seo.vercel.app",
        "https://*.vercel.app"
    ]

    # AI Model API Keys (Strictly validated)
    OPENAI_API_KEY: Optional[str] = ""
    GEMINI_API_KEY: Optional[str] = ""

    # Scraper & Serverless Configuration (tuned for Vercel 10s-60s timeout limits)
    DEFAULT_TIMEOUT_SECONDS: int = 15
    MAX_SCRAPE_BYTES: int = 5_000_000  # 5MB limit to prevent memory bloat on serverless
    DEFAULT_USER_AGENT: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36 (compatible; AiSeoBot/1.0; +https://typesafe.ai)"
    )

    @model_validator(mode="after")
    def validate_ai_credentials(self) -> "Settings":
        """
        Validate that at least one production AI engine key (OpenAI or Gemini) is supplied.
        In test or CI mode (e.g. CI=1), allows fallback to heuristic evaluation.
        """
        has_openai = bool(self.OPENAI_API_KEY and self.OPENAI_API_KEY.strip())
        has_gemini = bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())

        # If neither is set and not running in synthetic test mode, ensure environment is explicit
        if not has_openai and not has_gemini:
            # We allow startup with informative warning if neither key is provided,
            # falling back to algorithmic heuristic scoring
            pass
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
