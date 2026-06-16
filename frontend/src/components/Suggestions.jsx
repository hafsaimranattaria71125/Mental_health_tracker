import React, { useState, useEffect } from 'react';
import '../styles/Suggestions.css';

const API_URL = import.meta.env.VITE_API_URL;

function Suggestions({ user }) {
  const [suggestion, setSuggestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/api/suggestions/weekly?user_id=${user.user_id}`),
        fetch(`${API_URL}/api/suggestions/history?user_id=${user.user_id}&limit=10`),
      ]);

      const latestData = await latestRes.json();
      setSuggestion(latestData.suggestions ? latestData : null);

      const historyData = await historyRes.json();
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Could not load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="suggestions-container">
        <div className="sugg-loading">
          <div className="sugg-spinner" />
          <p>Loading your wellness suggestions…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggestions-container">
        <div className="sugg-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchSuggestions} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestions-container">
      {/* Current suggestion */}
      <div className="sugg-card current-sugg">
        <div className="sugg-card-header">
          <h2>💡 This Week's Wellness Suggestions</h2>
          <button onClick={fetchSuggestions} className="refresh-btn" title="Refresh">↻</button>
        </div>

        {suggestion ? (
          <>
            <div className="sugg-content">
              {suggestion.suggestions}
            </div>
            <p className="sugg-date">
              Week of {new Date(suggestion.week_start).toLocaleDateString('en-PK', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </>
        ) : (
          <div className="no-sugg">
            <div className="no-sugg-icon">🌱</div>
            <h3>No suggestions yet</h3>
            <p>
              Suggestions are generated weekly based on your journal entries.
              Keep journaling — your first suggestions will appear after a few entries!
            </p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 1 && (
        <div className="sugg-history">
          <h3>📚 Past Suggestions</h3>
          <div className="history-list">
            {history.slice(1).map((item) => (
              <div
                key={item.id}
                className={`history-item ${expanded === item.id ? 'open' : ''}`}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="history-item-header">
                  <span className="history-date">
                    Week of {new Date(item.week_start).toLocaleDateString('en-PK', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  <span className="history-toggle">{expanded === item.id ? '▲' : '▼'}</span>
                </div>
                {expanded === item.id ? (
                  <p className="history-full">{item.suggestions}</p>
                ) : (
                  <p className="history-preview">
                    {item.suggestions?.substring(0, 180)}…
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Suggestions;
