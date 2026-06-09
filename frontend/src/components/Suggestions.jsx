import React, { useState, useEffect } from 'react';
import '../styles/Suggestions.css';
import { VITE_API_URL } from '../config';
const API_URL = VITE_API_URL;
function Suggestions({ user }) {
  const [suggestion, setSuggestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      // Get latest
      const latestResponse = await fetch(
        `${API_URL}/api/suggestions/weekly?user_id=${user.user_id}`
      );
      const latestData = await latestResponse.json();
      setSuggestion(latestData.suggestions ? latestData : null);

      // Get history
      const historyResponse = await fetch(
        `${API_URL}/api/suggestions/history?user_id=${user.user_id}&limit=10`
      );
      const historyData = await historyResponse.json();
      setHistory(historyData);

    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading suggestions...</div>;
  }

  return (
    <div className="suggestions-container">
      {/* Current Suggestions */}
      <div className="current-suggestion">
        <h2>💡 This Week's Wellness Suggestions</h2>
        {suggestion ? (
          <div className="suggestion-card">
            <div className="suggestion-content">
              {suggestion.suggestions}
            </div>
            <p className="suggestion-date">
              Week of {new Date(suggestion.week_start).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="no-suggestion">
            <p>No suggestions yet. Start journaling to get personalized wellness tips!</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="suggestions-history">
          <h3>📚 Suggestion History</h3>
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className="history-item">
                <p className="history-date">
                  Week of {new Date(item.week_start).toLocaleDateString()}
                </p>
                <p className="history-preview">
                  {item.suggestions.substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Suggestions;