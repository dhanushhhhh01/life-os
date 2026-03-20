# 🚀 Quick Deploy Guide — Life OS

## ⚠️ Authentication Required

I've prepared everything for deployment, but **Railway and Vercel require you to authenticate**. Here are your options:

---

## Option 1: Deploy Yourself (Recommended — 5 minutes)

### Step 1: Push to GitHub

```bash
cd /home/ubuntu/.openclaw/workspace/life-os

# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/life-os.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `life-os` repository
4. Railway will auto-detect Python and deploy using `railway.toml`
5. **Add environment variables** in the Railway dashboard:
   ```
   SECRET_KEY=<generate-with-command-below>
   ENCRYPTION_KEY=<generate-with-command-below>
   DATABASE_URL=sqlite:///./lifeos.db
   ANTHROPIC_API_KEY=<your-key-optional>
   ```
   
   Generate keys:
   ```bash
   # SECRET_KEY
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # ENCRYPTION_KEY
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

6. Click **"Deploy"** — wait 2-3 minutes
7. Click **"Settings"** → **"Generate Domain"** to get your public URL
   **Copy this URL!** (e.g., `https://life-os-production.up.railway.app`)

### Step 3: Update Frontend Config

Edit `frontend/next.config.js` and replace the backend URL:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://YOUR-RAILWAY-URL.up.railway.app/:path*",  // ← PASTE YOUR RAILWAY URL HERE
      },
    ];
  },
};

module.exports = nextConfig;
```

Commit and push:
```bash
git add frontend/next.config.js
git commit -m "Update API URL for production"
git push
```

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your `life-os` repository
4. **Important**: Set **Root Directory** to `frontend`
5. Vercel will auto-detect Next.js
6. Click **"Deploy"** — wait 1-2 minutes
7. Copy your public URL (e.g., `https://life-os.vercel.app`)

**Done!** 🎉

---

## Option 2: Provide Authentication (CLI Deploy)

If you want me to deploy via CLI, provide:

### Railway Token:
1. Go to https://railway.app/account/tokens
2. Create a new token
3. Paste it here

### Vercel Token:
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Paste it here

Then I can run:
```bash
railway login --browserless --token YOUR_RAILWAY_TOKEN
vercel login --token YOUR_VERCEL_TOKEN
railway up
cd frontend && vercel --prod
```

---

## Option 3: Alternative Free Platforms

If Railway/Vercel don't work, try:

### Backend alternatives:
- **Render.com** (free tier, similar to Railway)
- **Fly.io** (free tier, dockerfile-based)
- **Replit** (instant deploy, public by default)

### Frontend alternatives:
- **Netlify** (free tier, similar to Vercel)
- **Cloudflare Pages** (free, very fast)
- **GitHub Pages** (free, but needs static export)

---

## 📦 What's Already Prepared

✅ Git repository initialized and committed  
✅ Railway config (`railway.toml`, `Procfile`)  
✅ Python runtime specified (`runtime.txt`)  
✅ CORS configured for production  
✅ Environment variables documented  
✅ Frontend proxy configured  
✅ `.gitignore` set up  
✅ All code is deployment-ready  

**The repo is 100% ready to deploy** — just needs your GitHub push + platform authentication!

---

## 🔗 Expected Final URLs

After deployment:
- **Backend API**: `https://<your-railway-app>.up.railway.app`
- **API Docs**: `https://<your-railway-app>.up.railway.app/docs`
- **Frontend UI**: `https://<your-vercel-app>.vercel.app`

**Cost**: $0 (both platforms have generous free tiers)

---

Need help? Let me know which option you want to proceed with!
