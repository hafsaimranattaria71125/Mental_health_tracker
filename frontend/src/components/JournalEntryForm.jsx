import React, { useState } from 'react';
import '../styles/JournalEntryForm.css';
import { VITE_API_URL } from '../config';

const API_URL = VITE_API_URL;

function JournalEntryForm({ user, onSuccess }) {
  const [text, setText] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('😐');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤗'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert('Please write something in your journal!');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/journal/predict?user_id=${user.user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          mood_emoji: moodEmoji,
          tags: tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      const data = await response.json();
      
      setResult({
        stress_category: data.stress_category,
        stress_confidence: (data.stress_confidence * 100).toFixed(1),
        entry_id: data.entry_id
      });

      // Reset form
      setText('');
      setTags('');
      setMoodEmoji('😐');

      // Show success message
      setTimeout(() => {
        setResult(null);
        onSuccess();
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-form-container">
      <div className="journal-form-card">
        <h2>📝 Write Your Journal Entry</h2>
        <p className="form-subtitle">Share your thoughts and feelings. Our AI will analyze your emotional state.</p>

        {result ? (
          <div className="result-message success">
            <h3>✅ Entry Saved Successfully!</h3>
            <div className="stress-result">
              <p><strong>Stress Category:</strong> {result.stress_category}</p>
              <p><strong>Stress Level:</strong> {result.stress_confidence}%</p>
            </div>
            <p className="redirect-text">Redirecting to history...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="journal-form">
            {/* Text Area */}
            <div className="form-group">
              <label>Your Thoughts</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write freely... What's on your mind today?"
                rows={8}
                disabled={loading}
              />
              <span className="char-count">{text.length} characters</span>
            </div>

            {/* Mood Selector */}
            <div className="form-group">
              <label>How are you feeling?</label>
              <div className="mood-selector">
                {moodEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className={`mood-btn ${moodEmoji === emoji ? 'selected' : ''}`}
                    onClick={() => setMoodEmoji(emoji)}
                    disabled={loading}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags (optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, stress, anxiety... (comma separated)"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Save Entry & Analyze'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default JournalEntryForm;