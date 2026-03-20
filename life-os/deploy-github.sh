#!/bin/bash
set -e

echo "🚀 Life OS — GitHub Deploy Helper"
echo "=================================="
echo ""

# Check if GitHub repo URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: GitHub repository URL required"
    echo ""
    echo "Usage: ./deploy-github.sh https://github.com/YOUR_USERNAME/life-os.git"
    echo ""
    echo "Steps:"
    echo "1. Create a new repo on GitHub: https://github.com/new"
    echo "2. Run: ./deploy-github.sh https://github.com/YOUR_USERNAME/REPO_NAME.git"
    exit 1
fi

REPO_URL="$1"

echo "📦 Setting up git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git branch -M main

echo "🔐 Generating deployment secrets..."
echo ""
echo "Copy these for Railway environment variables:"
echo "---------------------------------------------"
echo "SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
echo "ENCRYPTION_KEY=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"
echo "DATABASE_URL=sqlite:///./lifeos.db"
echo "---------------------------------------------"
echo ""

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to $REPO_URL"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway: https://railway.app/new"
echo "   → Select your GitHub repo"
echo "   → Add the environment variables above"
echo "   → Generate domain and copy the URL"
echo ""
echo "2. Update frontend/next.config.js with Railway URL"
echo ""
echo "3. Deploy frontend to Vercel: https://vercel.com/new"
echo "   → Select your GitHub repo"
echo "   → Set Root Directory to 'frontend'"
echo "   → Deploy!"
echo ""
echo "📖 Full guide: cat QUICK_DEPLOY.md"
