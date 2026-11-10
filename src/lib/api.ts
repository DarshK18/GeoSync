/**
 * api.ts: Production Type-Safe API Client with Exponential Backoff Retry Logic
 * Strongly-typed endpoints for AIO & GEO platform on Vercel Serverless.
 */

import {
  GeoAnalysisRequest,
  GeoAnalysisResponse
} from "@/types/aio";
import {
  AnalysisRequest,
  FullAnalysisResponse,
  CrawlerConfigsResponse,
  SimulationResult
} from "@/types/seo";

// In Vercel serverless / edge, requests to /api are relative and handled via vercel.json rewrites.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
}

/**
 * Robust fetch wrapper with exponential backoff and timeout handling.
 */
async function fetchWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 2, backoffMs = 1000, ...fetchInit } = options;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchInit,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(fetchInit.headers || {})
        }
      });

      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        let details: any = null;
        try {
          const errJson = await response.json();
          details = errJson;
          if (errJson.detail) {
            errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {
          // Non-JSON response
        }

        // Retry only on 5xx server errors or timeouts
        if (response.status >= 500 && attempt < retries) {
          const waitTime = backoffMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        throw new ApiError(response.status, errorMsg, details);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      lastError = err;
      if (err instanceof ApiError && err.statusCode < 500) {
        throw err;
      }
      if (attempt < retries) {
        const waitTime = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }
  throw new ApiError(500, lastError?.message || "Failed to communicate with AIO & GEO API service.");
}

/**
 * Primary AIO / GEO LangGraph Analysis Endpoint: POST /api/analyze-geo
 */
export async function analyzeGeo(request: GeoAnalysisRequest): Promise<GeoAnalysisResponse> {
  const endpoint = API_BASE ? `${API_BASE}/api/analyze-geo` : "/api/analyze-geo";
  return fetchWithRetry<GeoAnalysisResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify(request),
    retries: 1,
    backoffMs: 1500
  });
}

/**
 * Backward-compatible endpoint for legacy full analysis
 */
export async function analyzeUrl(request: AnalysisRequest): Promise<FullAnalysisResponse> {
  const endpoint = API_BASE ? `${API_BASE}/api/analyze` : "/api/analyze";
  return fetchWithRetry<FullAnalysisResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify(request),
    retries: 1,
    backoffMs: 1500
  });
}

/**
 * Health check ping to backend serverless function.
 */
export async function checkBackendHealth(): Promise<boolean> {
  const endpoint = API_BASE ? `${API_BASE}/api/health` : "/api/health";
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    return res.ok;
  } catch {
    return false;
  }
}
