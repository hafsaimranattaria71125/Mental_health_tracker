import React, { useState, useEffect } from 'react';
import '../styles/EntryHistory.css';

const API_URL = import.meta.env.VITE_API_URL;

const stressColor = (category) => {
  const map = {
    'Normal/No Stress': '#10b981',
    'Interpersonal/Social': '#f59e0b',
    'Financial Strain': '#f97316',
    'Anxiety/Panic': '#ef4444',
    'Abuse/Trauma': '#dc2626',
    'PTSD/Flashbacks': '#7f1d1d',
  };
  return map[category] || '#6c63ff';
};

function EntryHistory({ user, aiMode }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/journal/entries?user_id=${user.user_id}&limit=50`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/api/journal/entry/${entryId}?user_id=${user.user_id}`, {
        method: 'DELETE',
      });
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const filtered = entries.filter((e) =>
    e.text.toLowerCase().includes(search.toLowerCase()) ||
    (e.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading your entries…</div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2>📖 Journal History</h2>
          <p className="history-sub">{entries.length} {entries.length === 1 ? 'entry' : 'entries'} total</p>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search entries or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {search ? (
            <p>No entries match "<strong>{search}</strong>"</p>
          ) : (
            <>
              <div className="empty-icon">📝</div>
              <p>No entries yet. Write your first journal entry!</p>
            </>
          )}
        </div>
      ) : (
        <div className="entries-list">
          {filtered.map((entry) => {
            const isOpen = expanded === entry.id;
            const date = new Date(entry.created_at);
            return (
              <div key={entry.id} className={`entry-card ${isOpen ? 'open' : ''}`}>
                <div className="entry-header" onClick={() => setExpanded(isOpen ? null : entry.id)}>
                  <div className="entry-left">
                    <span className="entry-mood">{entry.mood_emoji || '📝'}</span>
                    <div className="entry-meta">
                      <span className="entry-date">
                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="entry-time">
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="entry-right">
                    {aiMode && entry.stress_category && (
                      <span
                        className="stress-pill"
                        style={{
                          background: `${stressColor(entry.stress_category)}18`,
                          color: stressColor(entry.stress_category),
                          borderColor: `${stressColor(entry.stress_category)}40`,
                        }}
                      >
                        {entry.stress_category}
                        <em>{(entry.stress_confidence * 100).toFixed(0)}%</em>
                      </span>
                    )}
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                    <span className="chevron">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                <div className={`entry-body ${isOpen ? 'visible' : ''}`}>
                  <p className="entry-text">{entry.text}</p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="tags">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {!isOpen && (
                  <p className="entry-preview">{entry.text.substring(0, 120)}{entry.text.length > 120 ? '…' : ''}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EntryHistory;
