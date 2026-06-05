# ============================================================================
# FASTAPI BACKEND - MENTAL HEALTH MOOD TRACKER
# ============================================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
import json
import uuid

# HuggingFace + Models
from huggingface_hub import InferenceClient

from supabase import create_client, Client

# Google OAuth
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.id_token import verify_oauth2_token
from google.auth.exceptions import GoogleAuthError

from apscheduler.schedulers.asyncio import AsyncIOScheduler

# GROQ for suggestions
import httpx

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Validate all env vars
required_vars = ["SUPABASE_URL", "SUPABASE_KEY", "HF_API_TOKEN", "GOOGLE_CLIENT_ID", "GROQ_API_KEY"]
for var in required_vars:
    if not os.getenv(var):
        raise ValueError(f"Missing environment variable: {var}")

# ============================================================================
# INITIALIZE CLIENTS
# ============================================================================

# Supabase
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# HuggingFace Inference
hf_client = InferenceClient(
    model="hafsaimranattaria7115/stress-detector-finetuned",
    token=HF_API_TOKEN
)

# FastAPI app
app = FastAPI(
    title="Mental Health Mood Tracker",
    description="Backend for mental health tracking with AI-powered suggestions",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://yourdomain.vercel.app"  # Update with your Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])
#app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class StressClasses:
    """Stress classification mapping"""
    CLASSES = {
        0: "Normal/No Stress",
        1: "Interpersonal/Social",
        2: "Financial Strain",
        3: "Abuse/Trauma",
        4: "Anxiety/Panic",
        5: "PTSD/Flashbacks"
    }

class JournalEntryRequest(BaseModel):
    text: str
    mood_emoji: Optional[str] = None
    tags: Optional[List[str]] = None

class JournalEntryResponse(BaseModel):
    id: str
    text: str
    stress_category: str
    stress_confidence: float
    timestamp: str
    mood_emoji: Optional[str]
    tags: Optional[List[str]]

class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token from frontend

class WeeklySuggestionResponse(BaseModel):
    id: str
    week_start: str
    suggestions: str
    stress_patterns: dict
    timestamp: str

class PredictionResponse(BaseModel):
    stress_category: str
    stress_confidence: float
    all_predictions: dict
    entry_id: str
    timestamp: str

# ============================================================================
# AUTHENTICATION FUNCTIONS
# ============================================================================

async def verify_google_token(token: str):
    """Verify Google OAuth token and return user info"""
    try:
        idinfo = verify_oauth2_token(
            token,
            GoogleRequest(),
            GOOGLE_CLIENT_ID
        )
        
        # Token is valid
        user_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']
        picture = idinfo.get('picture')
        
        return {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        }
    except GoogleAuthError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_or_create_user(user_info: dict):
    """Get user from DB or create if doesn't exist"""
    try:
        # Try to get user
        response = supabase_client.table("users").select("*").eq(
            "id", user_info["user_id"]
        ).execute()
        
        if response.data:
            return response.data[0]
        
        # Create new user
        new_user = {
            "id": user_info["user_id"],
            "email": user_info["email"],
            "name": user_info["name"],
            "picture_url": user_info["picture"],
            "created_at": datetime.now().isoformat()
        }
        
        response = supabase_client.table("users").insert(new_user).execute()
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User management error: {str(e)}")

# ============================================================================
# STRESS PREDICTION FUNCTIONS
# ============================================================================

async def predict_stress(text: str) -> dict:
    """Call HuggingFace API to predict stress category"""
    try:
        # Call HF Inference API
        result = hf_client.text_classification(text)
        
        # Format results
        predictions = {}
        top_prediction = None
        max_score = 0
        
        for pred in result:
            label = pred['label']
            score = pred['score']
            
            # Map label to class index
            for idx, class_name in StressClasses.CLASSES.items():
                if class_name.lower() == label.lower():
                    predictions[class_name] = score
                    if score > max_score:
                        max_score = score
                        top_prediction = class_name
        
        return {
            "stress_category": top_prediction or "Normal/No Stress",
            "stress_confidence": max_score,
            "all_predictions": predictions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# ============================================================================
# GROQ API - WEEKLY SUGGESTIONS
# ============================================================================

async def generate_weekly_suggestions(user_id: str, entries: List[dict]) -> str:
    """Generate wellness suggestions using GROQ Llama"""
    
    if not entries:
        return "No entries this week. Keep journaling to get personalized suggestions!"
    
    # Analyze entries
    stress_categories = {}
    total_entries = len(entries)
    
    for entry in entries:
        category = entry.get("stress_category", "Unknown")
        stress_categories[category] = stress_categories.get(category, 0) + 1
    
    # Build prompt
    prompt = f"""
You are a compassionate mental health wellness advisor. Based on the following journal entry data, 
provide 3-4 specific, actionable wellness suggestions.

Data:
- Total entries: {total_entries}
- Stress categories detected: {json.dumps(stress_categories)}
- Average confidence: {sum(e.get('stress_confidence', 0) for e in entries) / len(entries):.2%}

Provide suggestions that:
1. Are specific to the stress categories detected
2. Are actionable and practical
3. Include both immediate relief techniques and long-term strategies
4. Are compassionate and non-judgmental

Format as clear, helpful text.
"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a mental health wellness advisor."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
            
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                suggestions_text = result["choices"][0]["message"]["content"]
                return suggestions_text
            else:
                return "Unable to generate suggestions. Please try again later."
    
    except Exception as e:
        print(f"GROQ API error: {str(e)}")
        return f"Error generating suggestions: {str(e)}"

# ============================================================================
# SCHEDULER - WEEKLY SUGGESTIONS
# ============================================================================

scheduler = AsyncIOScheduler()

async def weekly_suggestion_job():
    """Run every Sunday at 9 AM"""
    try:
        # Get all users
        users_response = supabase_client.table("users").select("id").execute()
        users = users_response.data
        
        for user in users:
            user_id = user["id"]
            
            # Get entries from last 7 days
            week_start = datetime.now() - timedelta(days=7)
            
            entries_response = supabase_client.table("journal_entries").select("*").gte(
                "created_at", week_start.isoformat()
            ).eq("user_id", user_id).execute()
            
            entries = entries_response.data or []
            
            # Generate suggestions
            suggestions = await generate_weekly_suggestions(user_id, entries)
            
            # Store suggestions
            suggestion_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "week_start": week_start.isoformat(),
                "suggestions": suggestions,
                "patterns": json.dumps({
                    "total_entries": len(entries),
                    "stress_categories": list(set(e.get("stress_category") for e in entries))
                }),
                "created_at": datetime.now().isoformat()
            }
            
            supabase_client.table("weekly_suggestions").insert(suggestion_record).execute()
            
    except Exception as e:
        print(f"Weekly suggestion job error: {str(e)}")

# Schedule the job (Sunday 9 AM)
scheduler.add_job(
    weekly_suggestion_job,
    "cron",
    day_of_week="6",  # Sunday
    hour=9,
    minute=0
)

@app.on_event("startup")
async def start_scheduler():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.shutdown()

# ============================================================================
# ROUTES - AUTHENTICATION
# ============================================================================

@app.post("/api/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    try:
        # Verify token
        user_info = await verify_google_token(auth_request.token)
        
        # Get or create user
        user = await get_or_create_user(user_info)
        
        return {
            "user_id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "picture_url": user["picture_url"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# ============================================================================
# ROUTES - JOURNAL ENTRIES
# ============================================================================

@app.post("/api/journal/predict", response_model=PredictionResponse)
async def predict_journal_entry(entry: JournalEntryRequest, user_id: str):
    """Predict stress from journal entry"""
    try:
        # Verify user exists
        user_check = supabase_client.table("users").select("*").eq("id", user_id).execute()
        if not user_check.data:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Get prediction
        prediction = await predict_stress(entry.text)
        
        # Save entry
        entry_id = str(uuid.uuid4())
        journal_record = {
            "id": entry_id,
            "user_id": user_id,
            "text": entry.text,
            "stress_category": prediction["stress_category"],
            "stress_confidence": prediction["stress_confidence"],
            "mood_emoji": entry.mood_emoji,
            "tags": entry.tags,
            "created_at": datetime.now().isoformat()
        }
        
        supabase_client.table("journal_entries").insert(journal_record).execute()
        
        return PredictionResponse(
            stress_category=prediction["stress_category"],
            stress_confidence=prediction["stress_confidence"],
            all_predictions=prediction["all_predictions"],
            entry_id=entry_id,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/journal/entries")
async def get_journal_entries(user_id: str, limit: int = 30):
    """Get user's journal entries"""
    try:
        response = supabase_client.table("journal_entries").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(limit).execute()
        
        return response.data or []
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/journal/entry/{entry_id}")
async def get_journal_entry(entry_id: str, user_id: str):
    """Get specific journal entry"""
    try:
        response = supabase_client.table("journal_entries").select("*").eq(
            "id", entry_id
        ).eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Entry not found")
        
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/journal/entry/{entry_id}")
async def delete_journal_entry(entry_id: str, user_id: str):
    """Delete journal entry"""
    try:
        # Verify ownership
        entry = supabase_client.table("journal_entries").select("*").eq(
            "id", entry_id
        ).execute()
        
        if not entry.data or entry.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        supabase_client.table("journal_entries").delete().eq("id", entry_id).execute()
        
        return {"message": "Entry deleted"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTES - SUGGESTIONS
# ============================================================================

@app.get("/api/suggestions/weekly")
async def get_weekly_suggestions(user_id: str):
    """Get latest weekly suggestions"""
    try:
        response = supabase_client.table("weekly_suggestions").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(1).execute()
        
        if not response.data:
            return {"message": "No suggestions yet"}
        
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suggestions/history")
async def get_suggestions_history(user_id: str, limit: int = 10):
    """Get suggestion history"""
    try:
        response = supabase_client.table("weekly_suggestions").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).limit(limit).execute()
        
        return response.data or []
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ROUTES - STATISTICS
# ============================================================================

@app.get("/api/stats/dashboard")
async def get_dashboard_stats(user_id: str):
    """Get dashboard statistics"""
    try:
        # Get all entries
        entries = supabase_client.table("journal_entries").select("*").eq(
            "user_id", user_id
        ).execute()
        
        data = entries.data or []
        
        if not data:
            return {
                "total_entries": 0,
                "stress_categories": {},
                "average_stress": 0,
                "entries_this_week": 0
            }
        
        # Calculate stats
        stress_categories = {}
        total_stress = 0
        week_ago = datetime.now() - timedelta(days=7)
        week_entries = 0
        
        for entry in data:
            category = entry.get("stress_category", "Unknown")
            stress_categories[category] = stress_categories.get(category, 0) + 1
            total_stress += entry.get("stress_confidence", 0)
            
            if datetime.fromisoformat(entry["created_at"]) > week_ago:
                week_entries += 1
        
        return {
            "total_entries": len(data),
            "stress_categories": stress_categories,
            "average_stress": total_stress / len(data) if data else 0,
            "entries_this_week": week_entries
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/mood-trends")
async def get_mood_trends(user_id: str, days: int = 30):
    """Get mood trends over time"""
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        response = supabase_client.table("journal_entries").select("*").gte(
            "created_at", cutoff_date.isoformat()
        ).eq("user_id", user_id).order("created_at", desc=False).execute()
        
        data = response.data or []
        
        # Group by date
        trends = {}
        for entry in data:
            date = entry["created_at"][:10]  # YYYY-MM-DD
            if date not in trends:
                trends[date] = {
                    "stress_avg": 0,
                    "count": 0,
                    "categories": {}
                }
            
            trends[date]["stress_avg"] += entry.get("stress_confidence", 0)
            trends[date]["count"] += 1
            
            category = entry.get("stress_category", "Unknown")
            trends[date]["categories"][category] = trends[date]["categories"].get(category, 0) + 1
        
        # Average stress per date
        for date in trends:
            trends[date]["stress_avg"] /= trends[date]["count"]
        
        return trends
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# ROOT
# ============================================================================

@app.get("/")
async def root():
    """API documentation"""
    return {
        "app": "Mental Health Mood Tracker Backend",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/google",
            "journal": "/api/journal/",
            "suggestions": "/api/suggestions/",
            "stats": "/api/stats/",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)