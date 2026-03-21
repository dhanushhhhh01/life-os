# 🚨 Critical Deployment Fix Required

## The Root Cause (You Found It! 🎯)

The `vercel.json` rewrite rule was pointing to a placeholder Railway URL instead of the local Vercel serverless function.

## Current Status

✅ `vercel.json` is fixed  
✅ `api/index.py` created  
✅ Code deployed to Vercel  
❌ **API routes still returning 404**

## Why It's Still Not Working

Vercel's warning: `"Build Completed in [11ms]"` indicates:
- Vercel isn't actually building Next.js or Python
- It's just uploading the files
- The `vercel.json` `builds` config isn't being recognized

**Root issue:** Vercel project settings are overriding the `vercel.json` configuration.

## The Real Fix (Do This in Vercel Dashboard)

### Step 1: Go to Project Settings
https://vercel.com/dhanush-ramesh-babus-projects/life-os/settings/general

### Step 2: Find "Build & Development Settings"
- Look for section that says "**Build Command**" and **"Output Directory"**

### Step 3: Override with Custom Values
- **Build Command:** Leave empty (let vercel.json handle it)
- **Output Directory:** Leave empty
- Make sure "**Auto-detect**" is UNCHECKED

### Step 4: Scroll down to "**Framework Preset**"
- Change from `Next.js` to `Other`
- This tells Vercel: "Stop trying to auto-detect, use vercel.json"

### Step 5: Click **Save**

### Step 6: Redeploy
```bash
cd /home/ubuntu/.openclaw/workspace/life-os
vercel deploy --prod
```

---

## Why This Works

When you set Framework to "Other" and disable auto-detect:
- Vercel **stops overriding** `vercel.json`
- Vercel **reads your builds** config:
  - `api/index.py` → `@vercel/python` (Python serverless)
  - `frontend/package.json` → `@vercel/next` (Next.js app)
- Vercel **applies your routes** config:
  - `/api/*` → Python function
  - `/*` → Next.js frontend

---

## Test After Deploying

```bash
# Should return: {"status": "ok"}
curl https://life-os-sage-beta.vercel.app/api/health

# Should return: FastAPI Swagger UI (HTML)
curl https://life-os-sage-beta.vercel.app/api/docs
```

---

## Alternative: Restructure (If Dashboard Approach Fails)

If the dashboard method doesn't work, we can restructure:

```
current:
  life-os/
  ├── api/
  ├── app/
  ├── frontend/
  └── vercel.json

restructured:
  life-os/
  ├── api/
  ├── public/
  ├── src/  ← (frontend files moved here)
  └── vercel.json
```

But let's try the dashboard fix first—it's simpler!

---

## Files That Have Been Fixed

✅ `/api/index.py` — Serverless function handler  
✅ `/vercel.json` — Proper builds and routes config  
✅ `/frontend/next.config.js` — Removed broken rewrites  

Everything is in place. Just need Vercel to apply the config!
