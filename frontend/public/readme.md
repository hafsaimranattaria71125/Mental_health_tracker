# Mental Health Tracker - Frontend

React + Vite frontend for the Mental Health Mood Tracker application.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your credentials:
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:8000

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for Production
```bash
npm run build
npm run preview
```

## Technology Stack
- React 18
- Vite
- Google OAuth
- CSS3

## File Structure
src/
├── components/         # React components
│   ├── JournalEntryForm.jsx
│   ├── Dashboard.jsx
│   ├── EntryHistory.jsx
│   └── Suggestions.jsx
├── styles/            # Component styles
└── App.jsx           # Main app component

## Key Features Implemented
- ✅ Google OAuth authentication
- ✅ Journal entry form with mood selection
- ✅ Dashboard with statistics
- ✅ Entry history with delete
- ✅ Weekly suggestions display
- ✅ Responsive design
- ✅ Real-time data fetching

## Deployment (Vercel)

### 1. Connect GitHub
```bash
git push origin main
```

### 2. Deploy on Vercel
```bash
npm i -g vercel
vercel
```

### 3. Set Environment Variables
In Vercel dashboard add:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_URL` (your Railway backend URL)

## Troubleshooting

### Port Already in Use
```bash
kill -9 $(lsof -t -i:5173)
```

### CORS Errors
Ensure backend CORS includes your frontend URL.

### Google Login Not Working
- Verify CLIENT_ID in .env
- Check Google Cloud Console settings
- Ensure http://localhost:5173 is authorized