import React, { useEffect, useState } from "react";
import '../styles/common.css';
import '../styles/dashboard.css';

function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://mocki.io/v1/b8a4dbf9-02b3-4b32-9e4e-2e34f7133a9c")
      .then(res => res.json())
      .then(info => {
        console.log("API Response:", info);
        setData(info || {});
      })
      .catch(err => {
        console.error("Fetch Error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading Dashboard...</p>;

  const {
    username = "User",
    careerChoices = 0,
    quizPerformance = 0,
    roadmapCompleted = 0,
    totalRoadmaps = 0,
    activeDays = 0,
    roadmapPercentage = 0,
    recentActivity = []
  } = data;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {username}</h2>
        <p>Your learning progress overview</p>
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <h3>Career Choices</h3>
          <p>{careerChoices} Explored</p>
        </div>
        <div className="stat-card">
          <h3>Quiz Performance</h3>
          <p>Average Score: {quizPerformance}%</p>
        </div>
        <div className="stat-card">
          <h3>Roadmap Progress</h3>
          <p>{roadmapCompleted} / {totalRoadmaps} Completed</p>
        </div>
        <div className="stat-card">
          <h3>Engagement</h3>
          <p>Active {activeDays} days/week</p>
        </div>
      </section>

      <section className="progress-section">
        <h3>Roadmap Completion</h3>
        <progress value={roadmapPercentage} max="100"></progress>
        <p>{roadmapPercentage}% completed</p>
      </section>

      <section className="activity-section">
        <h3>Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <ul>
            {recentActivity.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No recent activity</p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;