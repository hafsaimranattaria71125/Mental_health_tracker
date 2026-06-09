import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Disclaimer from './components/Disclaimer';
import JournalEntryForm from './components/JournalEntryForm';
import Dashboard from './components/Dashboard';
import EntryHistory from './components/EntryHistory';
import Suggestions from './components/Suggestions';
import './App.css';
import { VITE_API_URL } from './config';
const API_URL = VITE_API_URL;
function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Check if user is already logged in and disclaimer was accepted
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const disclaimerAccepted = localStorage.getItem('disclaimer-accepted');
    
    if (savedUser && disclaimerAccepted) {
      setUser(JSON.parse(savedUser));
    } else if (savedUser) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      // First show disclaimer
      localStorage.setItem('temp-token', credentialResponse.credential);
      setShowDisclaimer(true);
      
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisclaimerAccept = async () => {
    try {
      const token = localStorage.getItem('temp-token');
      
      // Send to backend
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token
        })
      });

      const userData = await response.json();
      
      // Save user data
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('temp-token');
      setShowDisclaimer(false);
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('disclaimer-accepted');
    setActiveTab('dashboard');
  };

  // Show disclaimer if needed
  if (showDisclaimer) {
    return <Disclaimer onAccept={handleDisclaimerAccept} />;
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🧠 Mental Health Mood Tracker</h1>
          <p>AI-powered journal analysis for better mental health</p>
          
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Login Failed')}
            size="large"
            text="continue_with"
          />
          
          <div className="login-features">
            <h3>Features:</h3>
            <ul>

              <li>✨ AI-powered stress detection</li>
              <li>💡 Personalized wellness suggestions</li>
              <li>📝 Secure journal entries</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ... rest of the app code stays the same
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🧠 Mental Health Tracker</h1>
          <div className="header-right">
            <span className="user-info">
              <img src={user.picture_url} alt={user.name} className="user-avatar" />
              <div>
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-button ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          ✍️ New Entry
        </button>
        <button
          className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📖 History
        </button>
        <button
          className={`nav-button ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          💡 Suggestions
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'entry' && <JournalEntryForm user={user} onSuccess={() => setActiveTab('history')} />}
        {activeTab === 'history' && <EntryHistory user={user} />}
        {activeTab === 'suggestions' && <Suggestions user={user} />}
      </main>
    </div>
    
  );
}

export default App;
