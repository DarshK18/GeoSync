"""
api/index.py: Alternate Vercel Serverless Entry Point
Imports and exposes the FastAPI app from api.main for maximum Vercel builder compatibility.
"""
from api.main import app

__all__ = ["app"]
