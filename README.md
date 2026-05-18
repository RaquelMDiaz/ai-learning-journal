# Starter App

A minimal full-stack app: **FastAPI** backend + plain **HTML/JS** frontend,
with a built-in chat interface powered by the **Anthropic Claude API**.

---

## Project Structure

```
starter-app/
├── backend/
│   ├── main.py           # FastAPI app with /api/chat endpoint
│   └── requirements.txt  # Python dependencies
└── frontend/
    └── index.html        # Chat UI (no build step needed)
```

---

## Setup & Running

### 1. Set your Anthropic API key

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the backend

```bash
uvicorn main:app --reload
# → Running on http://localhost:8000
# → API docs at http://localhost:8000/docs
```

### 4. Open the frontend

Just open `frontend/index.html` in your browser — no build step needed.

---

## API Endpoints

| Method | Path        | Description                          |
|--------|-------------|--------------------------------------|
| GET    | `/`         | Health check                         |
| POST   | `/api/chat` | Send a message, get a Claude reply   |

### Example request

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Claude!"}'
```

---

## Next Steps

See the README section below, or the walkthrough in the conversation where this was generated.
