# 🧠 Life OS — Personal Second Brain & Life Coach

AI-powered personal dashboard that tracks goals, mood, energy, habits, and journal entries.

## Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL running locally (or update `DATABASE_URL` in `.env`)

### 1. Set up PostgreSQL
```bash
# Create the database and user
sudo -u postgres psql -c "CREATE USER lifeos WITH PASSWORD 'lifeos';"
sudo -u postgres psql -c "CREATE DATABASE lifeos OWNER lifeos;"
```

### 2. Configure environment
```bash
cd life-os
cp .env.example .env
# Edit .env with your actual SECRET_KEY and DATABASE_URL
```

### 3. Install & Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Open API docs
Go to **http://localhost:8000/docs** — full interactive Swagger UI.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Get JWT token |
| POST | `/goals` | ✅ | Create a goal |
| GET | `/goals` | ✅ | List your goals |
| GET | `/goals/{id}` | ✅ | Get a single goal |
| PATCH | `/goals/{id}` | ✅ | Update a goal |
| DELETE | `/goals/{id}` | ✅ | Delete a goal |
| POST | `/checkin` | ✅ | Log mood & energy (1-10) |
| GET | `/checkin` | ✅ | Recent check-ins |
| GET | `/checkin/today` | ✅ | Today's check-in |
| POST | `/journal` | ✅ | Write a journal entry |
| GET | `/journal` | ✅ | List entries |
| GET | `/journal/{id}` | ✅ | Read an entry |
| DELETE | `/journal/{id}` | ✅ | Delete an entry |
| POST | `/habits` | ✅ | Create a habit |
| GET | `/habits` | ✅ | List habits |
| PATCH | `/habits/{id}/log` | ✅ | Log habit completion |
| DELETE | `/habits/{id}` | ✅ | Delete a habit |

## Auth
All protected endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

Get a token via `/auth/register` or `/auth/login`.

## Project Structure
```
life-os/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app entry point
│   ├── config.py         # Environment config
│   ├── database.py       # SQLAlchemy engine & session
│   ├── models.py         # ORM models (DB schema)
│   ├── schemas.py        # Pydantic request/response models
│   ├── auth.py           # JWT + password hashing
│   └── routers/
│       ├── auth_router.py
│       ├── goals_router.py
│       ├── checkin_router.py
│       ├── journal_router.py
│       └── habits_router.py
├── .env.example
├── requirements.txt
├── run.sh
└── README.md
```

## 🧠 AI Endpoints (Phase 2)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/briefing` | ✅ | Personalized morning plan |
| POST | `/ai/mood-insights` | ✅ | Mood/energy pattern analysis |
| POST | `/ai/coach` | ✅ | Life coaching chat |
| POST | `/ai/journal-assist` | ✅ | AI journaling assistant |

### AI Setup
Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Next Up (Phase 3)
- [ ] Frontend dashboard (React + Next.js)
- [ ] Memory/context engine (vector search over journal)
- [ ] Decision framework engine
- [ ] Spaced repetition for learning goals
