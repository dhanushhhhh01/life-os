# Life OS — Deployment Guide

## 🚂 Backend Deployment (Railway.app)

### Option A: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd life-os
railway init

# Add environment variables
railway variables set SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
railway variables set ENCRYPTION_KEY="$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"
railway variables set ANTHROPIC_API_KEY="your-api-key-here"
railway variables set DATABASE_URL="sqlite:///./lifeos.db"  # or PostgreSQL URL

# Deploy
railway up

# Get URL
railway domain
```

### Option B: Deploy via GitHub

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `life-os` repository
5. Add environment variables:
   - `SECRET_KEY`: Generate with `python3 -c 'import secrets; print(secrets.token_urlsafe(32))'`
   - `ENCRYPTION_KEY`: Generate with `python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'`
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (optional for AI features)
   - `DATABASE_URL`: Railway will auto-provision PostgreSQL if you add the plugin, or use SQLite default
6. Railway will auto-deploy on push
7. Copy the public URL (e.g., `https://life-os-production.up.railway.app`)

---

## ▲ Frontend Deployment (Vercel)

### Prerequisites
You need the backend URL from Railway first!

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd life-os/frontend

# Update API URL in next.config.js to point to Railway backend
# (See step below)

# Login and deploy
vercel login
vercel --prod
```

### Option B: Deploy via GitHub

1. Update `frontend/next.config.js` to use your Railway backend URL:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://YOUR-RAILWAY-APP.up.railway.app/:path*",  // ← UPDATE THIS
      },
    ];
  },
};

module.exports = nextConfig;
```

2. Push to GitHub (if not already done)

3. Go to [Vercel.com](https://vercel.com)
4. Click "New Project" → Import your GitHub repo
5. Set Root Directory to `frontend`
6. Add environment variable (optional):
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
7. Deploy!
8. Copy the public URL (e.g., `https://life-os.vercel.app`)

---

## 🔐 Post-Deployment Security

For production use beyond a demo:

1. **Restrict CORS** in `app/security/middleware.py`:
   ```python
   allowed_origins = ["https://your-vercel-app.vercel.app"]
   ```

2. **Set strong secrets** (not demo values)

3. **Use PostgreSQL** instead of SQLite:
   - Railway: Add PostgreSQL plugin
   - Set `DATABASE_URL` to the connection string

4. **Add authentication** (already built-in, but test it)

5. **Enable HTTPS only** (both platforms do this by default)

---

## 📋 Summary

After deployment, you'll have:
- **Backend API**: `https://your-app.up.railway.app`
- **Frontend UI**: `https://your-app.vercel.app`
- **Database**: SQLite (on Railway volume) or PostgreSQL (Railway plugin)

**Total cost**: $0 (free tiers on both platforms)
