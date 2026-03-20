#!/bin/bash
# Life OS — Quick start script
# Usage: ./run.sh

set -e

echo "🚀 Life OS — Starting up..."

# Check for .env
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "   Edit .env with your database credentials before running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

# Run the server
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📖 API docs at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
