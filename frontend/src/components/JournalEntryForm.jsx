import React, { useState } from 'react';
import '../styles/JournalEntryForm.css';

const API_URL = import.meta.env.VITE_API_URL;

const moodEmojis = [
  { emoji: '😭', label: 'Very Sad' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😄', label: 'Great' },
  { emoji: '🤗', label: 'Amazing' },
];

function JournalEntryForm({ user, aiMode, onSuccess }) {
  const [text, setText] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('😐');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const isGuest = !user;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() || text.trim().length < 10) {
      setError('Please write at least a sentence before saving.');
      return;
    }

    // Guest mode: just show a local result, no API call
    if (isGuest) {
      setResult({ guest: true });
      setTimeout(() => setResult(null), 4000);
      setText('');
      setTags('');
      setMoodEmoji('😐');
      return;
    }

    // Simple mode: save without AI analysis
    if (!aiMode) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/journal/simple?user_id=${user.user_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            mood_emoji: moodEmoji,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          }),
        });

        if (!response.ok) throw new Error('Failed to save entry');

        setResult({ simple: true, mood: moodEmoji });
        setText('');
        setTags('');
        setMoodEmoji('😐');
        setTimeout(() => { setResult(null); onSuccess?.(); }, 3000);
      } catch (err) {
        setError('Failed to save entry. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // AI mode: analyze + save
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/journal/predict?user_id=${user.user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mood_emoji: moodEmoji,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult({
        ai: true,
        stress_category: data.stress_category,
        stress_confidence: (data.stress_confidence * 100).toFixed(1),
        entry_id: data.entry_id,
      });

      setText('');
      setTags('');
      setMoodEmoji('😐');
      setTimeout(() => { setResult(null); onSuccess?.(); }, 4000);
    } catch (err) {
      setError(`Failed to analyze entry: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (text && !window.confirm('Clear your entry?')) return;
    setText('');
    setTags('');
    setMoodEmoji('😐');
    setResult(null);
    setError('');
  };

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

  if (result) {
    return (
      <div className="journal-form-container">
        <div className="result-card">
          {result.guest && (
            <>
              <div className="result-icon">✍️</div>
              <h3>Entry Written!</h3>
              <p className="result-sub">Sign in to save and track your entries over time.</p>
            </>
          )}
          {result.simple && (
            <>
              <div className="result-icon">{result.mood}</div>
              <h3>Entry Saved!</h3>
              <p className="result-sub">Your journal entry has been saved. No AI analysis in Simple Mode.</p>
            </>
          )}
          {result.ai && (
            <>
              <div className="result-icon">✅</div>
              <h3>Entry Saved & Analyzed</h3>
              <div className="stress-badge-result" style={{ background: `${stressColor(result.stress_category)}18`, borderColor: stressColor(result.stress_category) }}>
                <span className="stress-cat" style={{ color: stressColor(result.stress_category) }}>
                  {result.stress_category}
                </span>
                <span className="stress-conf">{result.stress_confidence}% confidence</span>
              </div>
              <p className="result-sub">Redirecting to your history…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="journal-form-container">
      <div className="journal-form-card">
        {/* Header */}
        <div className="form-header">
          <div>
            <h2>
              {aiMode ? '🤖 Journal + AI Analysis' : '✍️ Journal Entry'}
            </h2>
            <p className="form-subtitle">
              {isGuest
                ? 'Writing as guest — entries are not saved'
                : aiMode
                ? 'Share your thoughts and get AI stress analysis'
                : 'Write freely — no AI, just your personal space'}
            </p>
          </div>
          {isGuest && (
            <div className="guest-warn">
              Guest mode — <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>Sign in</a> to save
            </div>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="journal-form">
          {/* Mood */}
          <div className="form-group">
            <label>How are you feeling right now?</label>
            <div className="mood-selector">
              {moodEmojis.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  className={`mood-btn ${moodEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => setMoodEmoji(emoji)}
                  title={label}
                  disabled={loading}
                >
                  {emoji}
                  <span className="mood-label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="form-group">
            <label>Your thoughts</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write freely… What's on your mind today? How are you feeling? What happened?"
              rows={10}
              disabled={loading}
            />
            <div className="text-meta">
              <span className={`char-count ${text.length > 2000 ? 'warn' : ''}`}>
                {text.length} chars · {wordCount} words
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags <span className="optional">(optional)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, relationships, sleep… (comma-separated)"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="clear-btn" onClick={handleClear} disabled={loading || !text}>
              Clear
            </button>
            <button type="submit" className="submit-btn" disabled={loading || !text.trim()}>
              {loading
                ? (aiMode ? '🔄 Analyzing…' : '💾 Saving…')
                : isGuest
                ? '✍️ Finish Writing'
                : aiMode
                ? '🤖 Save & Analyze'
                : '💾 Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JournalEntryForm;
