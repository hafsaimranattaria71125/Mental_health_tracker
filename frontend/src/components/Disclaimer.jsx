import React, { useState } from 'react';
import '../styles/Disclaimer.css';

function Disclaimer({ onAccept, onCancel, loading }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <span>🤖 AI Model Disclosure</span>
          <button className="disclaimer-close" onClick={onCancel} title="Cancel">✕</button>
        </div>

        <div className="disclaimer-content">
          <h2>Before you continue</h2>

          <div className="disclaimer-section">
            <h3>📊 How AI is Used</h3>
            <p>
              This app uses <strong>MentalRoBERTa</strong> (via HuggingFace) to analyze your journal
              entries for stress patterns, and <strong>Llama 3.1 70B</strong> (via Groq) to generate
              personalized wellness suggestions.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>🔍 What it detects</h3>
            <ul>
              <li>Normal / No Stress</li>
              <li>Interpersonal / Social Stress</li>
              <li>Financial Strain</li>
              <li>Abuse / Trauma</li>
              <li>Anxiety / Panic</li>
              <li>PTSD / Flashbacks</li>
            </ul>
          </div>

          <div className="disclaimer-section warn-section">
            <h3>⚠️ Important Disclaimers</h3>
            <ul>
              <li>This is <strong>not</strong> a replacement for professional mental health care</li>
              <li>AI predictions are not 100% accurate</li>
              <li>In crisis? Contact emergency services or a mental health professional immediately</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>🔒 Your Privacy</h3>
            <ul>
              <li>All entries are private — only you can see them</li>
              <li>Data is stored securely on Supabase</li>
              <li>You can delete any entry at any time</li>
            </ul>
          </div>

          <div className="disclaimer-section crisis-section">
            <h3>📞 Crisis Resources</h3>
            <div className="crisis-grid">
              <span><strong>Pakistan</strong> Umang: 0317-4288665</span>
              <span><strong>US</strong> 988 Suicide & Crisis Lifeline</span>
              <span><strong>UK</strong> Samaritans: 116 123</span>
              <span><strong>Global</strong> findahelpline.com</span>
            </div>
          </div>
        </div>

        <div className="disclaimer-footer">
          <label className="accept-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I understand and accept the terms above</span>
          </label>
          <div className="disclaimer-btns">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="accept-btn"
              disabled={!accepted || loading}
              onClick={onAccept}
            >
              {loading ? 'Signing in…' : 'Continue to App →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;
