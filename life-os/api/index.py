"""
Vercel Serverless Function Entry Point
Exposes the FastAPI app as a Vercel serverless handler
"""
from app.main import app

# Vercel expects a handler named 'app' or 'handler'
handler = app
