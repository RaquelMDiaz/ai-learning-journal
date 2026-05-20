# AI Learning Journal

A full-stack web application built for learning and practising **FastAPI** and **Python backend development**. Users can create an account, start AI-powered learning journal sessions on any topic, and chat with Groq — with the full conversation history saved to a database. A contact form is also included.

---

## Features

- **AI-powered journal** — start a session on any topic and chat with Groq; full conversation history is preserved across sessions
- **User authentication** — register and log in with email/password (JWT-based); Google OAuth is scaffolded and activates once credentials are configured
- **Contact form** — with frontend and backend validation
- **Database persistence** — SQLite via SQLAlchemy ORM; four tables: users, sessions, messages, contact submissions
- **Localisation** — English (UK), German (Germany), and Spanish (Argentina); language switcher in the UI
- **No frontend framework** — plain HTML, CSS, and JavaScript; React upgrade is planned for a later stage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite, SQLAlchemy, Alembic |
| Authentication | JWT (python-jose), bcrypt (passlib) |
| AI | Groq API |
| Google OAuth | Authlib, HTTPX |
| Frontend | HTML, CSS, Vanilla JS |

---

## Project Structure

```
ai-learning-ajournal
├── backend/
│   ├── main.py                  # App entry point; registers all routers
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   ├── alembic.ini              # Alembic configuration
│   ├── alembic/
│   │   ├── env.py               # Alembic environment (wired to models)
│   │   └── versions/            # Auto-generated migration files
│   └── app/
│       ├── config.py            # Centralised settings from environment variables
│       ├── database.py          # Engine, SessionLocal, Base, get_db dependency
│       ├── auth.py              # Password hashing, JWT, get_current_user dependency
│       ├── models/
│       │   ├── user.py          # Users table
│       │   ├── session.py       # Journal sessions table
│       │   ├── message.py       # Chat messages table
│       │   └── contact.py       # Contact form submissions table
│       ├── schemas/
│       │   ├── user.py          # Pydantic request/response models for users
│       │   ├── session.py       # Pydantic models for sessions and messages
│       │   └── contact.py       # Pydantic models + validation for contact form
│       └── routers/
│           ├── auth.py          # POST /api/auth/register, /login, /me; Google OAuth
│           ├── users.py         # GET /api/users/me, /users/{id}
│           ├── sessions.py      # CRUD for journal sessions
│           ├── chat.py          # POST /api/chat/{session_id} — AI chat endpoint
│           └── contact.py       # POST /api/contact — contact form submission
└── frontend/
    ├── index.html               # Single-page app (Auth, Journal, Chat, Contact views)
    └── i18n/
        ├── en_GB.json           # English (UK) translations
        ├── de_DE.json           # German (Germany) translations
        └── es_AR.json           # Spanish (Argentina) translations
```

---

## Database Schema

```
users                     sessions                  messages
──────────────────────    ──────────────────────    ──────────────────────
id (PK)                   id (PK)                   id (PK)
email (unique)            user_id (FK → users)      session_id (FK → sessions)
name                      topic                     role ('user'|'assistant')
hashed_password           created_at                content
google_id (nullable)      updated_at                created_at
is_active
created_at

contact_submissions
───────────────────
id (PK)
name
email
message
submitted_at
```

---

## Setup

### Prerequisites

- Python 3.11 or higher
- An [Anthropic API key](https://console.anthropic.com) (free tier available)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/RaquelMDiaz/ai-learning-journal
cd ai-learning-journal
```

### 2. Create and activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # macOS / Linux
# venv\Scripts\activate   # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# Required
GROQ_API_KEY=sk-ant-...

# Optional — Google OAuth (see section below)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 5. Create the database

```bash
alembic upgrade head
```

This creates `journal.db` with all four tables.

### 6. Start the backend

```bash
uvicorn main:app --reload
```

The API is now running at `http://localhost:8000`.
Interactive API docs are available at `http://localhost:8000/docs`.

### 7. Open the frontend

Open `frontend/index.html` directly in your browser, or serve it with:

```bash
cd ../frontend
python3 -m http.server 5500
# Then open http://localhost:5500
```

---

## API Endpoints

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Log in, receive JWT |
| GET | `/api/auth/me` | Yes | Get current user profile |
| GET | `/api/auth/google` | No | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/sessions/` | Yes | List all sessions for current user |
| POST | `/api/sessions/` | Yes | Create a new journal session |
| GET | `/api/sessions/{id}` | Yes | Get session with full message history |
| DELETE | `/api/sessions/{id}` | Yes | Delete a session and its messages |
| POST | `/api/chat/{session_id}` | Yes | Send a message; get Groq's reply |
| POST | `/api/contact/` | No | Submit contact form |
| GET | `/api/contact/` | Yes | List all contact submissions |

---

## Google OAuth Setup (optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:8000/api/auth/google/callback` as an authorised redirect URI
4. Copy the Client ID and Secret into your `.env` file

The backend code is fully implemented — adding the credentials is all that's needed to activate it.

---

## Localisation

The frontend supports three locales, switchable via the language selector in the navigation bar:

| Locale | Language |
|---|---|
| `en_GB` | English (UK) |
| `de_DE` | German (Germany) |
| `es_AR` | Spanish (Argentina) — uses *voseo* |

Translation strings live in `frontend/i18n/`. To add a new language, copy one of the existing JSON files, translate the values, and add the option to the `<select>` in `index.html`.

---

## Development Notes

- **Migrations** — whenever you change a model, run `alembic revision --autogenerate -m "description"` followed by `alembic upgrade head`
- **Switching to PostgreSQL** — change `DATABASE_URL` in `app/database.py` to a `postgresql+psycopg2://...` connection string; no other changes needed
- **Protected routes** — add `current_user: User = Depends(get_current_user)` to any route function to require authentication
- **React upgrade** — the backend API is frontend-agnostic; migrating to React later requires no backend changes

---

## Production environment

- Frontend deployment done with Vercel (https://ai-learning-journal-lake.vercel.app/)
- Backend deployment done with Railway (https://ai-learning-journal-production.up.railway.app/)

Important: since the nature of this app is purely for personal learning purposes, Vercel and Railway are being run on free tiers. Hence, certain limitations might be encountered when accessing the frontend URL. An alternative, is to run this app locally. The following section details the steps to do so.

## Running the App Locally

### Prerequisites

- Python 3.11 or higher
- A [Groq API key](https://console.groq.com) (free, no credit card required)
- Git
- A Google account (optional, only needed for Google OAuth)

---

### 1. Clone the repository

```bash
git clone https://github.com/RaquelMDiaz/ai-learning-journal.git
cd assisted-ai-learning-app
```

---

### 2. Set up the backend

**Create and activate a virtual environment:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```env
# Generate with: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-generated-secret-key

GROQ_API_KEY=your-groq-api-key

# Optional — only needed for Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

FRONTEND_URL=http://localhost:5500
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**Create the database:**

```bash
alembic upgrade head
```

This creates a `journal.db` file with all required tables.

**Start the backend server:**

```bash
uvicorn main:app --reload
```

The API is now running at `http://localhost:8000`.
Interactive API docs are available at `http://localhost:8000/docs`.

---

### 3. Set up the frontend

Open a **second terminal** and navigate to the frontend folder:

```bash
cd assisted-ai-learning-app/frontend
python3 -m http.server 5500
```

The frontend is now running at `http://localhost:5500`.

---

### 4. Open the app

Go to `http://localhost:5500` in your browser.

---

### 5. Stopping the servers

In each terminal, press `Ctrl+C` to stop the server.

---

### Daily development workflow

Every time you come back to work on the project, follow these steps:

**Terminal 1 — backend:**

```bash
cd assisted-ai-learning-app/backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — frontend:**

```bash
cd assisted-ai-learning-app/frontend
python3 -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

---

### Google OAuth setup (optional)

If you want to enable "Continue with Google" login:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:5500` to **Authorised JavaScript origins**
4. Add `http://localhost:8000/api/auth/google/callback` to **Authorised redirect URIs**
5. Copy the Client ID and Secret into your `.env` file
6. Restart the backend server

---

### Troubleshooting

**Translations not showing** — make sure you are serving the frontend via `python3 -m http.server 5500` and not opening `index.html` directly in the browser.

**"Address already in use" error** — a previous server is still running on that port. Kill it with:

```bash
lsof -ti:5500 | xargs kill -9   # for the frontend
lsof -ti:8000 | xargs kill -9   # for the backend
```

**Changes not reflecting in the browser** — clear the browser cache or open the page in an incognito window.

**Database issues** — if you need to reset the database, delete `backend/journal.db` and run `alembic upgrade head` again. Note this will erase all data.

---

## Licence

MIT
