
import React, { useState } from 'react';
import '../styles/Disclaimer.css';

function Disclaimer({ onAccept }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('disclaimer-accepted', 'true');
    onAccept();
  };

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          🤖 AI Model Disclosure
        </div>
        
        <div className="disclaimer-content">
          <h2>Important Information</h2>
          
          <div className="disclaimer-section">
            <h3>📊 How AI is Used</h3>
            <p>
              This application uses an AI model called <strong>MentalRoBERTa</strong> to analyze your journal entries 
              and detect stress levels. The model is trained to recognize patterns in mental health-related text.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>🔍 What the AI Does</h3>
            <ul>
              <li>✅ Analyzes journal text for stress indicators</li>
              <li>✅ Categorizes stress into 6 types:
                <ul>
                  <li>Normal/No Stress</li>
                  <li>Interpersonal/Social Stress</li>
                  <li>Financial Strain</li>
                  <li>Abuse/Trauma</li>
                  <li>Anxiety/Panic</li>
                  <li>PTSD/Flashbacks</li>
                </ul>
              </li>
              <li>✅ Generates wellness suggestions using GROQ Llama-3.1-70B</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>⚠️ Important Disclaimers</h3>
            <ul>
              <li>❌ This is NOT a replacement for professional mental health treatment</li>
              <li>❌ AI predictions may not be 100% accurate</li>
              <li>❌ If you're in crisis, please contact emergency services or a mental health professional</li>
              <li>✅ Use these insights as a tool for self-reflection</li>
              <li>✅ Share results with your healthcare provider if needed</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>🔒 Data Privacy</h3>
            <ul>
              <li>All your entries are private and encrypted</li>
              <li>Only you can see your data</li>
              <li>Data is stored securely on Supabase</li>
              <li>You can delete entries anytime</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>📞 Need Help?</h3>
            <p>
              If you're experiencing a mental health crisis:
            </p>
            <ul>
              <li><strong>US:</strong> National Suicide Prevention Lifeline: 988</li>
              <li><strong>UK:</strong> Samaritans: 116 123</li>
              <li><strong>Pakistan:</strong> AASRA: 9820466726</li>
              <li><strong>International:</strong> findahelpline.com</li>
            </ul>
          </div>
        </div>

        <div className="disclaimer-footer">
          <label className="accept-checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I understand and accept the terms
          </label>
          <button
            className="accept-btn"
            disabled={!accepted}
            onClick={handleAccept}
          >
            Continue to App
          </button>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;