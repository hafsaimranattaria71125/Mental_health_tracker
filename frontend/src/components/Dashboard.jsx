import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

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

function Dashboard({ user, aiMode }) {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        fetch(`${API_URL}/api/stats/dashboard?user_id=${user.user_id}`),
        fetch(`${API_URL}/api/stats/mood-trends?user_id=${user.user_id}&days=30`),
      ]);

      if (!statsRes.ok || !trendsRes.ok) throw new Error('Failed to load data');

      setStats(await statsRes.json());
      setTrends(await trendsRes.json());
    } catch (err) {
      setError('Unable to load dashboard. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your dashboard…</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!stats) return null;

  const trendEntries = trends ? Object.entries(trends) : [];
  const maxStress = trendEntries.length
    ? Math.max(...trendEntries.map(([, d]) => d.stress_avg))
    : 1;

  return (
    <div className="dashboard-container">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <p className="stat-label">Total Entries</p>
            <p className="stat-value">{stats.total_entries}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">This Week</p>
            <p className="stat-value">{stats.entries_this_week}</p>
          </div>
        </div>

        {aiMode && (
          <div className="stat-card orange">
            <div className="stat-icon">🧘</div>
            <div className="stat-content">
              <p className="stat-label">Avg Stress Level</p>
              <p className="stat-value">{(stats.average_stress * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Stress breakdown — only in AI mode */}
      {aiMode && Object.keys(stats.stress_categories || {}).length > 0 && (
        <div className="chart-section">
          <h2>Stress Categories Breakdown</h2>
          <div className="stress-categories">
            {Object.entries(stats.stress_categories)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => {
                const max = Math.max(...Object.values(stats.stress_categories));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={category} className="category-item">
                    <span
                      className="category-dot"
                      style={{ background: stressColor(category) }}
                    />
                    <span className="category-name">{category}</span>
                    <div className="category-bar">
                      <div
                        className="category-fill"
                        style={{
                          width: `${pct}%`,
                          background: stressColor(category),
                        }}
                      />
                    </div>
                    <span className="category-count">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Mood trend chart */}
      {trendEntries.length > 0 && (
        <div className="chart-section">
          <h2>30-Day {aiMode ? 'Stress' : 'Activity'} Trend</h2>
          <div className="trends-chart">
            {trendEntries.map(([date, data]) => {
              const heightPct = aiMode
                ? Math.max((data.stress_avg / (maxStress || 1)) * 100, 6)
                : Math.min((data.count / 3) * 100, 100);
              return (
                <div key={date} className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{ height: `${heightPct}%` }}
                    title={
                      aiMode
                        ? `${date}: ${(data.stress_avg * 100).toFixed(0)}% stress · ${data.count} entries`
                        : `${date}: ${data.count} entries`
                    }
                  />
                  <span className="trend-date">{date.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <p className="chart-note">
            {aiMode ? 'Bar height = average stress level for that day' : 'Bar height = number of entries'}
          </p>
        </div>
      )}

      {stats.total_entries === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✍️</div>
          <p>No entries yet — start journaling to see your stats here!</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
