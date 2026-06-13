# 🧠 Mental Health Tracker

AI-powered journal analysis application for mental health tracking with personalized wellness suggestions.

## Project Overview

- **Frontend:** React with Vite
- **Backend:** FastAPI with Python
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Google OAuth 2.0
- **ML Models:** MentalRoBERTa (Fine-tuned on DREADDIT)
- **Suggestions:** GROQ Llama-3.1-70B
- **Deployment:** Hugging Face Space (Backend), Vercel (Frontend)

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

## License

MIT License - Feel free to use and modify
