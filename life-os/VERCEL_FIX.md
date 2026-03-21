# ⚠️ Vercel Configuration Fix

## Problem
The current deployment has a 404 on `/api/*` endpoints because Vercel needs to know about the monorepo structure.

## Solution: Configure Root Directory

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**  
   https://vercel.com/dhanush-ramesh-babus-projects/life-os/settings

2. **Navigate to Settings → General**

3. **Find "Root Directory" setting**

4. **Set Root Directory to: `frontend`**

5. **Click "Save"**

6. **Redeploy:**
   ```bash
   cd /home/ubuntu/.openclaw/workspace/life-os
   vercel deploy --prod
   ```

### Method 2: Via Vercel CLI

```bash
cd /home/ubuntu/.openclaw/workspace/life-os
vercel --root-directory frontend --prod
```

---

## How It Works

With `frontend` as the root directory:

```
Project Structure:
life-os/
├── api/
│   └── index.py          ← Python serverless function
├── frontend/             ← **ROOT DIRECTORY**
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── app/                  ← FastAPI app code
├── requirements.txt      ← Python dependencies
└── vercel.json           ← Deployment config
```

Vercel will:
1. Detect Next.js in `frontend/` (auto-build)
2. Build Python function from `/api/index.py`
3. Route `/api/*` to Python
4. Route everything else to Next.js

---

## Alternative: Restructure (Not Recommended Now)

If the dashboard method doesn't work, we could restructure:
- Move `frontend/*` to root
- Keep `api/` at root
- Update paths

But this requires more changes, so try the dashboard method first.

---

## After Fixing

Test these URLs:
- Frontend: https://life-os-sage-beta.vercel.app
- Health: https://life-os-sage-beta.vercel.app/api/health  
  Expected: `{"status": "ok"}`
- Docs: https://life-os-sage-beta.vercel.app/api/docs
  Expected: FastAPI Swagger UI
