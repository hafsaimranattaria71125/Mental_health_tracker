import React, { useState, useEffect } from 'react';
import '../styles/EntryHistory.css';

function EntryHistory({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/journal/entries?user_id=${user.user_id}&limit=50`
      );
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await fetch(`http://localhost:8000/api/journal/entry/${entryId}?user_id=${user.user_id}`, {
        method: 'DELETE'
      });

      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  if (loading) {
    return <div className="loading">Loading entries...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>📝 No entries yet. Start by creating your first journal entry!</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>📖 Journal Entries</h2>
      <div className="entries-list">
        {entries.map(entry => (
          <div key={entry.id} className="entry-card">
            <div className="entry-header">
              <div className="entry-meta">
                <span className="entry-date">
                  {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
                </span>
                <span className="entry-mood">{entry.mood_emoji}</span>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className="delete-btn"
                title="Delete entry"
              >
                🗑️
              </button>
            </div>

            <p className="entry-text">{entry.text.substring(0, 300)}...</p>

            <div className="entry-footer">
              <div className="stress-badge">
                <span className="stress-label">{entry.stress_category}</span>
                <span className="stress-confidence">
                  {(entry.stress_confidence * 100).toFixed(0)}%
                </span>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="tags">
                  {entry.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EntryHistory;