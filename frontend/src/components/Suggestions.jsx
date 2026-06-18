import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function Suggestions({ user }) {
  const [suggestion, setSuggestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatest();
  }, [user]);

  const fetchLatest = async () => {
    try {
      setLoading(true);
      setError('');
      const [latestRes, histRes] = await Promise.all([
        fetch(`${API_URL}/api/suggestions/weekly?user_id=${user.user_id}`),
        fetch(`${API_URL}/api/suggestions/history?user_id=${user.user_id}&limit=5`),
      ]);

      if (latestRes.ok) {
        const data = await latestRes.json();
        // If no suggestions yet, the backend returns { message: "..." }
        setSuggestion(data.suggestions ? data : null);
      }
      if (histRes.ok) {
        setHistory(await histRes.json());
      }
    } catch (err) {
      setError('Unable to load suggestions. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await fetch(
        `${API_URL}/api/suggestions/generate?user_id=${user.user_id}`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate suggestions');
      }
      const data = await res.json();
      setSuggestion(data);
      // Refresh history too
      const histRes = await fetch(`${API_URL}/api/suggestions/history?user_id=${user.user_id}&limit=5`);
      if (histRes.ok) setHistory(await histRes.json());
    } catch (err) {
      setError(`Could not generate suggestions: ${err.message}`);
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading">Loading suggestions…</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>💡 AI Wellness Suggestions</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Personalized suggestions based on your journal entries
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            background: generating ? '#9ca3af' : '#6c63ff',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
          }}
        >
          {generating ? '⏳ Generating…' : '✨ Generate Now'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 16, marginBottom: 20, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Latest suggestion */}
      {suggestion ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#4f46e5' }}>Latest Suggestions</h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric',
              }) : ''}
            </span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151', fontSize: '0.95rem' }}>
            {suggestion.suggestions}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#f9fafb',
          border: '2px dashed #d1d5db',
          borderRadius: 12,
          padding: 40,
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💡</div>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            No suggestions yet. Click <strong>Generate Now</strong> to get personalized wellness advice based on your journal entries.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              background: generating ? '#9ca3af' : '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {generating ? '⏳ Generating…' : '✨ Generate My Suggestions'}
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div>
          <h3 style={{ marginBottom: 12, color: '#374151' }}>📚 Past Suggestions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.slice(1).map((item) => (
              <details key={item.id} style={{ background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <summary style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: 500, color: '#6b7280', fontSize: '0.9rem' }}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
                  }) : 'Past suggestion'}
                </summary>
                <div style={{ padding: '0 16px 16px', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151', fontSize: '0.9rem' }}>
                  {item.suggestions}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Suggestions;
