# Life  Railway + Vercel Deployment GuideOS 

## Architecture

```
Browser → Vercel (Next.js frontend)
              ↓  /api/* proxy
         Railway (FastAPI backend)
              ↓
         Railway PostgreSQL (or SQLite for dev)
         [optional] Railway Redis (for caching)
```

## 1. Deploy Backend to Railway

### One-click deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manual steps
1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Python via `railway.toml`
5. Add **PostgreSQL** plugin: Project → + New → Database → PostgreSQL
   - Railway sets `DATABASE_URL` automatically
6. Add env variables (Settings → Variables):
   ```
   SECRET_KEY=<run: python3 -c "import secrets; print(secrets.token_hex(32))">
   ENCRYPTION_KEY=<run: python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
   ANTHROPIC_API_KEY=sk-ant-...
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. Deploy → copy your Railway URL (e.g. `https://life-os.railway.app`)

### Optional: Add Redis caching
 Database → Redis
- Railway sets `REDIS_URL` automatically
- The backend will use Redis automatically; no code changes needed

---

## 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import Git repo
2. Set **Root Directory**: `frontend`
3. Framework: **Next.js** (auto-detected)
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-life-os.railway.app
   ```
5. Deploy

### Update CORS on Railway
After Vercel deploy, add your Vercel URL to Railway:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## 3. Custom Domain (optional)

- **Vercel**: Settings → Domains → Add your domain
- **Railway**: Settings → Networking → Custom Domain

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL URL (auto-set by Railway plugin) |
| `SECRET_KEY` | Yes | JWT signing key (generate with `secrets.token_hex(32)`) |
| `ENCRYPTION_KEY` | Yes | Fernet key for field encryption |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `FRONTEND_URL` | Yes | Vercel frontend URL for CORS |
| `REDIS_URL` | No | Redis URL for caching (auto-set by Railway Redis plugin) |
| `ALGORITHM` | No | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token TTL (default: 1440 = 24h) |

---

## Caching Notes

The app uses an **in-memory cache by default** (zero config).

| Endpoint type | Cache TTL |
|---------------|-----------|
| Health check | 10s |
| Journal entries | 30–120s |
| Habits/Goals | 30–60s |
| AI insights | 300s (5min) |
| Dashboard | 45s |

To invalidate all cache: `DELETE /api/cache/clear`
To view stats: `GET /api/cache/stats`

If you add Redis, the cache automatically uses Redis instead of memory.
