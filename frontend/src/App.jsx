import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Disclaimer from './components/Disclaimer';
import JournalEntryForm from './components/JournalEntryForm';
import Dashboard from './components/Dashboard';
import EntryHistory from './components/EntryHistory';
import Suggestions from './components/Suggestions';
import './App.css';
const API_URL =import.meta.env.VITE_API_URL;
function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('entry');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  // ── Restore session ──────────────────────────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const disclaimerAccepted = localStorage.getItem('disclaimer-accepted');
    const savedAiMode = localStorage.getItem('ai-mode');

    if (savedAiMode !== null) setAiMode(savedAiMode === 'true');

    if (savedUser && disclaimerAccepted === 'true') {
      try {
        setUser(JSON.parse(savedUser));
        setActiveTab('dashboard');
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // ── Google login ─────────────────────────────────────────────────────────
  const handleGoogleSuccess = (credentialResponse) => {
    localStorage.setItem('temp-token', credentialResponse.credential);
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('temp-token');

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Login failed');
      }

      const userData = await response.json();

      localStorage.setItem('disclaimer-accepted', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('temp-token');

      setUser(userData);
      setIsGuest(false);
      setShowDisclaimer(false);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
      setShowDisclaimer(false);
      localStorage.removeItem('temp-token');
    } finally {
      setLoading(false);
    }
  };

  // Add these three new handlers directly under handleDisclaimerAccept:
  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
    localStorage.removeItem('temp-token');
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('user');
    localStorage.removeItem('disclaimer-accepted');
    setActiveTab('entry');
  };

  const handleGuestMode = () => {
    setIsGuest(true);
    setActiveTab('entry');
  };

  const toggleAiMode = (val) => {
    setAiMode(val);
    localStorage.setItem('ai-mode', String(val));
  };

  // ── Disclaimer screen ────────────────────────────────────────────────────
  if (showDisclaimer) {
    return (
      <Disclaimer
        onAccept={handleDisclaimerAccept}
        onCancel={handleDisclaimerCancel}
        loading={loading}
      />
    );
  }
  // ── Landing / login screen ───────────────────────────────────────────────
  if (!user && !isGuest) {
    return (
      <div className="login-bg">
        <div className="login-card">
          <div className="login-logo">🧠</div>
          <h1>Mental Health Tracker</h1>
          <p className="login-tagline">Your private space to reflect, understand, and grow</p>

          <div className="login-modes">
            <div className="mode-card">
              <div className="mode-icon">🤖</div>
              <h3>AI Mode</h3>
              <p>Stress analysis + personalized wellness suggestions powered by AI</p>
            </div>
            <div className="mode-card">
              <div className="mode-icon">✍️</div>
              <h3>Simple Mode</h3>
              <p>Pure journaling — no AI, just you and your thoughts</p>
            </div>
          </div>

          <div className="login-divider"><span>Sign in to save your entries</span></div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google login failed. Please try again.')}
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <button className="guest-btn" onClick={handleGuestMode}>
            Continue as Guest
            <span className="guest-note">Entries won't be saved</span>
          </button>

          <p className="privacy-note">🔒 Your data is private and encrypted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="brand-icon">🧠</span>
            <span className="brand-name">MindJournal</span>
          </div>

          <div className="header-center">
            {/* AI / Simple mode toggle */}
            <div className="mode-toggle" title="Switch between AI analysis and simple journaling">
              <button
                className={`toggle-opt ${!aiMode ? 'active' : ''}`}
                onClick={() => toggleAiMode(false)}
              >
                ✍️ Simple
              </button>
              <button
                className={`toggle-opt ${aiMode ? 'active' : ''}`}
                onClick={() => toggleAiMode(true)}
              >
                🤖 AI
              </button>
            </div>
          </div>

          <div className="header-right">
            {user ? (
              <div className="user-info">
                {user.picture_url && (
                  <img src={user.picture_url} alt={user.name} className="user-avatar" />
                )}
                <div className="user-text">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
            ) : (
              <span className="guest-badge">Guest</span>
            )}
            <button onClick={handleLogout} className="logout-btn">
              {user ? 'Sign Out' : 'Exit'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-inner">
          <button
            className={`nav-button ${activeTab === 'entry' ? 'active' : ''}`}
            onClick={() => setActiveTab('entry')}
          >
            ✍️ <span>New Entry</span>
          </button>
          {!isGuest && (
            <>
              <button
                className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 <span>Dashboard</span>
              </button>
              <button
                className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📖 <span>History</span>
              </button>
              {aiMode && (
                <button
                  className={`nav-button ${activeTab === 'suggestions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  💡 <span>Suggestions</span>
                </button>
              )}
            </>
          )}
          {isGuest && (
            <div className="guest-nav-hint">
              <span>Sign in to access Dashboard, History & Suggestions</span>
              <button className="signin-inline-btn" onClick={() => setIsGuest(false)}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="app-main">
        {activeTab === 'entry' && (
          <JournalEntryForm
            user={isGuest ? null : user}
            aiMode={aiMode}
            onSuccess={() => !isGuest && setActiveTab('history')}
          />
        )}
        {!isGuest && activeTab === 'dashboard' && <Dashboard user={user} aiMode={aiMode} />}
        {!isGuest && activeTab === 'history' && <EntryHistory user={user} aiMode={aiMode} />}
        {!isGuest && activeTab === 'suggestions' && aiMode && <Suggestions user={user} />}
      </main>
    </div>
  );
}

export default App;
