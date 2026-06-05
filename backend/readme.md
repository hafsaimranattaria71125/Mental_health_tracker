# Mental Health Tracker - Backend

FastAPI backend for the Mental Health Mood Tracker application.

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon public key
- `HF_API_TOKEN` - HuggingFace API token
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GROQ_API_KEY` - GROQ API key

### 4. Run Server
```bash
python main.py
```

Server will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login

### Journal Entries
- `POST /api/journal/predict` - Predict stress from entry
- `GET /api/journal/entries` - Get user's entries
- `GET /api/journal/entry/{id}` - Get specific entry
- `DELETE /api/journal/entry/{id}` - Delete entry

### Suggestions
- `GET /api/suggestions/weekly` - Get weekly suggestions
- `GET /api/suggestions/history` - Get suggestion history

### Statistics
- `GET /api/stats/dashboard` - Get dashboard stats
- `GET /api/stats/mood-trends` - Get mood trends

### Health
- `GET /health` - Health check
- `GET /` - API info

## Development

### Run with Auto-reload
```bash
python -m uvicorn main:app --reload
```

### Run Tests
```bash
pytest
```

### Code Style
```bash
black main.py
flake8 main.py
```

## API Documentation

Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

## Deployment

See `docs/DEPLOYMENT.md` for production deployment instructions.

## Troubleshooting

### Import Errors
```bash
pip install -r requirements.txt --upgrade
```

### Port Already in Use
```bash
lsof -ti:8000 | xargs kill -9
```

### CORS Errors
Update `CORS_ORIGINS` in `main.py` with your frontend URL.

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check internet connection
- Verify database tables exist

## Structure

- `main.py` - FastAPI application
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (create from .env.example)