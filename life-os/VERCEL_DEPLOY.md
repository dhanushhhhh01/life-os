# 🚀 Vercel Deployment Guide (Full Stack)

## Overview
Both frontend (Next.js) and backend (FastAPI) run on **Vercel** using serverless functions.

## Architecture
```
User Request
    ↓
Vercel Edge Network
    ↓
    ├─→ /api/* → Python Serverless Function (FastAPI)
    └─→ /*      → Next.js Frontend
```

## Files Changed

### 1. ✅ `api/index.py` (NEW)
- Exposes FastAPI app as Vercel serverless handler
- Entry point for all `/api/*` requests

### 2. ✅ `vercel.json` (UPDATED)
- **builds**: Defines Next.js + Python builds
- **routes**: Routes `/api/*` to Python function, everything else to frontend
- **headers**: Security headers (CSP, XSS, etc.)

### 3. ✅ `frontend/next.config.js` (UPDATED)
- Removed `rewrites()` - routing handled by Vercel config
- Keeps security headers, image optimization, etc.

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Required
```bash
# Database (use Vercel Postgres or external PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/lifeos

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here

# API Key for AI features
ANTHROPIC_API_KEY=sk-ant-...
```

### Optional
```bash
# Frontend API URL (defaults to /api)
NEXT_PUBLIC_API_URL=/api

# Environment
NODE_ENV=production
```

## Deployment Steps

### First Time Setup
1. **Install Vercel CLI** (if not already):
   ```bash
   npm i -g vercel
   ```

2. **Link project**:
   ```bash
   cd /home/ubuntu/.openclaw/workspace/life-os
   vercel link
   ```

3. **Set environment variables**:
   ```bash
   # Interactive mode
   vercel env add DATABASE_URL
   vercel env add SECRET_KEY
   vercel env add ANTHROPIC_API_KEY
   
   # Or use Vercel dashboard: https://vercel.com/dashboard
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Subsequent Deployments
```bash
cd /home/ubuntu/.openclaw/workspace/life-os
vercel --prod
```

Or push to GitHub main branch (if GitHub integration enabled).

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy `DATABASE_URL` from Vercel dashboard
3. Add to environment variables
4. Database tables auto-create on first run (via `app/main.py` lifespan)

### Option 2: External PostgreSQL
- Use Supabase, Neon, or any PostgreSQL provider
- Set `DATABASE_URL` in Vercel environment variables

## Verification Checklist

After deployment, verify:

- ✅ Frontend loads: `https://your-app.vercel.app`
- ✅ API health: `https://your-app.vercel.app/api/health`
- ✅ API docs: `https://your-app.vercel.app/api/docs`
- ✅ Registration works: Create test account
- ✅ Login works: Authenticate with test account
- ✅ Dashboard loads: View after login

## Local Development

### Backend (FastAPI)
```bash
cd /home/ubuntu/.openclaw/workspace/life-os
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

### Both Together
Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then run both servers in separate terminals.

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure `requirements.txt` has all Python dependencies
- Ensure `frontend/package.json` has all Node dependencies

### API Not Working
- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible from Vercel
- Check function logs: Vercel Dashboard → Functions → Select `/api/index.py`

### CORS Errors
- Check `app/security/middleware.py` allows your domain
- Default allows all origins in dev, specific origin in prod

### Database Errors
- Ensure database is accessible (not localhost!)
- Check connection string format
- For Vercel Postgres, use the provided `DATABASE_URL`

## Performance Notes

- **Serverless functions** have cold starts (~1-2s first request)
- **Warm requests** respond in ~100-300ms
- Use Vercel **Edge Middleware** for ultra-low latency (if needed)
- Consider **Vercel KV** for caching (Redis-compatible)

## Cost Estimate

**Vercel Free Tier** (Hobby):
- 100 GB bandwidth/month
- 100 hours serverless execution/month
- Unlimited requests (with fair use)

**Vercel Pro** ($20/month):
- 1 TB bandwidth
- 1000 hours execution
- Priority support

Database costs depend on provider choice.

---

**Need help?** Check:
- Vercel Docs: https://vercel.com/docs
- FastAPI on Vercel: https://vercel.com/guides/using-fastapi-with-vercel
- Next.js Docs: https://nextjs.org/docs
