dreaddit,empathetic emotions taken from kaggle. only text, labels were kept. remaining cols were deleted.
duplicates deleted in empathetic emotions.
# 🧠 Mental Health Mood Tracker

AI-powered journal analysis application for mental health tracking with personalized wellness suggestions.

## Project Overview

- **Frontend:** React with Vite
- **Backend:** FastAPI with Python
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Google OAuth 2.0
- **ML Models:** MentalRoBERTa (Fine-tuned on DREADDIT)
- **Suggestions:** GROQ Llama-3.1-70B
- **Deployment:** Railway (Backend), Vercel (Frontend)

## Features

✨ **AI-Powered Stress Detection**
- Multi-class stress classification (6 categories)
- Real-time analysis from journal entries

📊 **Dashboard & Analytics**
- 30-day mood trends
- Stress category distribution
- Weekly statistics

💡 **Personalized Suggestions**
- GROQ-powered wellness recommendations
- Weekly suggestion generation
- Pattern-based advice

📝 **Secure Journal**
- Private journal entries
- Mood emoji tracking
- Custom tags
- Full delete capability

🔐 **Authentication**
- Google OAuth integration
- Secure user data
- Row-level security in database

## Architecture
User (React Frontend)
↓
Google OAuth Login
↓
Supabase Auth
↓
FastAPI Backend
├─ HuggingFace Inference API (Stress Detection)
├─ Supabase Database
└─ GROQ Llama API (Suggestions)
## Quick Start

### Prerequisites
- Node.js 16+
- Python 3.9+
- Git
- Accounts: Google Cloud, Supabase, HuggingFace, GROQ

### 1. Clone Repository
```bash
git clone <repository-url>
cd mental-health-tracker
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env`:
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
HF_API_TOKEN=your-hf-token
GOOGLE_CLIENT_ID=your-google-client-id
GROQ_API_KEY=your-groq-api-key
Run backend:
```bash
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env`:
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:8000
Run frontend:
```bash
npm run dev
```

### 4. Database Setup
1. Go to Supabase Dashboard
2. Create new project
3. Run SQL from `database/schema.sql`
4. Copy URL and Key to `.env`

## Configuration

See detailed setup guides in `/docs`:
- `GOOGLE_OAUTH_SETUP.md` - Google authentication
- `SUPABASE_SETUP.md` - Database configuration
- `GROQ_SETUP.md` - LLM API setup
- `DEPLOYMENT.md` - Production deployment

## API Documentation

See `docs/API_DOCUMENTATION.md` for complete API endpoints.

## Models Used

- **Stress Detection:** `hafsaimranattaria7115/stress-detector-finetuned`
  - Based: MentalRoBERTa
  - Trained: DREADDIT dataset
  - Classes: 6 (Normal, Interpersonal, Financial, Abuse, Anxiety, PTSD)
  - Accuracy: 88-92%

- **Suggestions:** GROQ Llama-3.1-70B (Free tier)

## Project Structure
├── backend/          # FastAPI server
├── frontend/         # React app
├── database/         # SQL schemas
├── docs/            # Documentation
└── README.md        # This file
## Development

### Backend Development
```bash
cd backend
python main.py --reload
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Running Tests
```bash
cd backend
pytest
```

## Deployment

### Production Checklist
- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] Google OAuth configured
- [ ] GROQ API key valid
- [ ] HuggingFace token valid
- [ ] CORS settings updated
- [ ] SSL certificates ready

See `docs/DEPLOYMENT.md` for detailed steps.

## Troubleshooting

### Backend Issues
- **Port already in use:** `lsof -ti:8000 | xargs kill -9`
- **Module not found:** Run `pip install -r requirements.txt`
- **CORS errors:** Check `main.py` CORS origins

### Frontend Issues
- **Blank page:** Check browser console for errors
- **Google Login not working:** Verify CLIENT_ID in `.env`
- **API calls failing:** Ensure backend is running on `localhost:8000`

### Database Issues
- **Connection refused:** Check Supabase URL and key
- **RLS policy errors:** Verify SQL schema was run
- **Missing tables:** Re-run `database/schema.sql`

## API Response Examples

### Stress Prediction
```json
{
  "stress_category": "Anxiety/Panic",
  "stress_confidence": 0.92,
  "all_predictions": {
    "Normal/No Stress": 0.05,
    "Interpersonal/Social": 0.02,
    "Financial Strain": 0.01,
    "Abuse/Trauma": 0.00,
    "Anxiety/Panic": 0.92,
    "PTSD/Flashbacks": 0.00
  },
  "entry_id": "uuid-here",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Support

For issues, check:
1. Documentation in `/docs`
2. API logs in backend console
3. Browser console for frontend errors
4. Supabase logs for database issues

## License

MIT License - Feel free to use and modify

## Authors

- Hafsa Imran Attaria
- Mental Health Tracker Team

---

**Last Updated:** January 2025