import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
const API_URL = import.meta.env.VITE_API_URL;

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch(
        `${API_URL}/api/stats/dashboard?user_id=${user.user_id}`
      );
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch trends
      const trendsResponse = await fetch(
        `${API_URL}/api/stats/mood-trends?user_id=${user.user_id}&days=30`
      );
      const trendsData = await trendsResponse.json();
      setTrends(trendsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Entries</h3>
            <p className="stat-value">{stats.total_entries}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Average Stress</h3>
            <p className="stat-value">{(stats.average_stress * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>This Week</h3>
            <p className="stat-value">{stats.entries_this_week}</p>
          </div>
        </div>
      </div>

      {/* Stress Categories */}
      <div className="chart-section">
        <h2>Stress Categories</h2>
        <div className="stress-categories">
          {Object.entries(stats.stress_categories).map(([category, count]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{
                    width: `${(count / Math.max(...Object.values(stats.stress_categories))) * 100}%`
                  }}
                />
              </div>
              <span className="category-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Trends */}
      <div className="chart-section">
        <h2>30-Day Mood Trend</h2>
        <div className="trends-chart">
          {trends && Object.entries(trends).map(([date, data]) => (
            <div key={date} className="trend-bar-container">
              <div
                className="trend-bar"
                style={{
                  height: `${Math.min(data.stress_avg * 100, 100)}px`
                }}
                title={`${date}: ${(data.stress_avg * 100).toFixed(0)}% stress`}
              />
              <span className="trend-date">{date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;