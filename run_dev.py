"""
run_dev.py: Dual Process Development Orchestrator for AIO & GEO Monorepo
Launches both the FastAPI Serverless Backend (Port 8000) and Next.js Frontend (Port 3000) concurrently.
"""

import os
import sys
import subprocess
import signal
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))

    print("=" * 72)
    print("  AIO & GEO — Enterprise Artificial Intelligence Optimization Platform")
    print("  Vercel Monorepo Architecture: Next.js 14 + Python FastAPI (LangGraph)")
    print("=" * 72)
    print("  Backend API: http://127.0.0.1:8000 (OpenAPI: http://127.0.0.1:8000/docs)")
    print("  Frontend UI: http://localhost:3000")
    print("  Pipeline:    POST /api/analyze-geo")
    print("=" * 72)
    print("Starting services... (Press Ctrl+C to terminate both)")

    # 1. Start Backend using python in .venv
    python_bin = os.path.join(root_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_bin):
        python_bin = sys.executable

    backend_proc = subprocess.Popen(
        [python_bin, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=root_dir
    )

    # 2. Start Frontend Next.js dev server at root
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=root_dir
    )

    def handle_exit(sig, frame):
        print("\nShutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)

    try:
        while True:
            time.sleep(1)
            # Check if any process terminated prematurely
            if backend_proc.poll() is not None:
                print("Backend terminated unexpectedly.")
                frontend_proc.terminate()
                break
            if frontend_proc.poll() is not None:
                print("Frontend terminated unexpectedly.")
                backend_proc.terminate()
                break
    except KeyboardInterrupt:
        handle_exit(None, None)

if __name__ == "__main__":
    main()
