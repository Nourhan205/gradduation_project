import React, { useState, useEffect } from 'react';
import '../styles/ComparisonTool.css';

const CareerComparisonTool = () => {
  const [careerData, setCareerData] = useState([]);
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample data 
  const getSampleData = () => [
    {
      id: 1,
      title: "Software Engineer",
      skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
      jobOutlook: "Excellent",
      growthRate: "22",
      medianSalary: "$110,140",
      education: "Bachelor's Degree",
      description: "Design, develop, and test software applications.",
    },
    {
      id: 2,
      title: "Data Scientist",
      skills: ["Python", "Machine Learning", "Statistics", "SQL"],
      jobOutlook: "Excellent",
      growthRate: "31",
      medianSalary: "$126,830",
      education: "Master's Degree",
      description: "Analyze complex data to extract insights and build predictive models.",
    },
    {
      id: 3,
      title: "UX/UI Designer",
      skills: ["Figma", "User Research", "Wireframing", "Prototyping"],
      jobOutlook: "Good",
      growthRate: "13",
      medianSalary: "$85,000",
      education: "Bachelor's Degree",
      description: "Create user-friendly and visually appealing digital interfaces.",
    },
    {
      id: 4,
      title: "Cybersecurity Analyst",
      skills: ["Network Security", "Risk Assessment", "Incident Response", "Linux"],
      jobOutlook: "Excellent",
      growthRate: "33",
      medianSalary: "$102,600",
      education: "Bachelor's Degree",
      description: "Protect computer systems and networks from cyber threats.",
    }
  ];


  useEffect(() => {
    setLoading(true);
    
    fetch('careers')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch careers');
        }
        return response.json();
      })
      .then(data => {
        setCareerData(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Failed to load career data');
        const sampleData = getSampleData();
        setCareerData(sampleData);
        setLoading(false);
      });
  }, []);


  const fetchComparisonData = (careerIds) => {
    if (careerIds.length < 2) {
      setComparisonData([]);
      setInsightsData(null);
      return;
    }

  
    fetch(`?ids=${careerIds.join(',')}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        return response.json();
      })
      .then(data => {
        setComparisonData(data.comparisonData || []);
        setInsightsData(data.insights || null);
      })
      .catch(err => {
        console.error('Comparison API Error:', err);
        setComparisonData([]);
        setInsightsData(null);
      });
  };


  const handleCareerSelect = (careerId) => {
    let newSelection;
    
    if (selectedCareers.includes(careerId)) {
      if (selectedCareers.length > 2) {
        newSelection = selectedCareers.filter(id => id !== careerId);
      } else {
        return;
      }
    } else {
      if (selectedCareers.length < 4) {
        newSelection = [...selectedCareers, careerId];
      } else {
        return;
      }
    }
    
    setSelectedCareers(newSelection);
    fetchComparisonData(newSelection);
  };

  const clearSelection = () => {
    setSelectedCareers([]);
    setComparisonData([]);
    setInsightsData(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="career-comparison-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading career data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="career-comparison-container">
      <header className="tool-header">
        <h1> Career Comparison Tool</h1>
      </header>

      <div className="tool-content">
        {/* Left Panel */}
        <div className="selection-panel">
          <div className="panel-header">
            <h2>Available Careers ({careerData.length})</h2>
            <div className="selection-info">
              <span className="selected-count">
                Selected: {selectedCareers.length}/4
              </span>
              {selectedCareers.length > 0 && (
                <button className="clear-btn" onClick={clearSelection}>
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="api-warning">
              ⚠️ Using sample data 
            </div>
          )}
          
          <div className="career-grid">
            {careerData.map(career => (
              <div 
                key={career.id}
                className={`career-card ${selectedCareers.includes(career.id) ? 'selected' : ''}`}
                onClick={() => handleCareerSelect(career.id)}
              >
                <div className="career-card-header">
                  <h3>{career.title}</h3>
                  <div className="selection-indicator">
                    {selectedCareers.includes(career.id) ? '✓' : '+'}
                  </div>
                </div>
                <p className="career-description">{career.description}</p>
                <div className="career-highlight">
                  <span>Median Salary: </span>
                  <strong>{career.medianSalary}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="comparison-panel">
          <h2>Comparison Results</h2>
          
          {comparisonData.length < 2 ? (
            <div className="comparison-placeholder">
              <div className="placeholder-icon">📊</div>
              <p>Select at least 2 careers to compare</p>
            </div>
          ) : (
            <>
              <div className="selected-careers-header">
                <h3>Comparing {comparisonData.length} Careers</h3>
                <p>Processed by backend API</p>
              </div>
              
              {/* Comparison Table */}
              <div className="comparison-table-container">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Metrics</th>
                      {comparisonData.map(career => (
                        <th key={career.id}>{career.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Skills */}
                    <tr>
                      <td className="metric-label">Required Skills</td>
                      {comparisonData.map(career => (
                        <td key={career.id}>
                          {career.skills ? (
                            <ul className="skills-list">
                              {career.skills.map((skill, index) => (
                                <li key={index}>{skill}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="no-data">No data</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Job Outlook */}
                    <tr>
                      <td className="metric-label">Job Outlook</td>
                      {comparisonData.map(career => (
                        <td key={career.id}>
                          <span className={`outlook-badge ${career.jobOutlook?.toLowerCase()}`}>
                            {career.jobOutlook || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Growth Rate */}
                    <tr>
                      <td className="metric-label">Growth Rate</td>
                      {comparisonData.map(career => (
                        <td key={career.id}>
                          <div className="growth-display">
                            <span className="growth-value">
                              {career.growthRate || '0'}% (from backend)
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Salary */}
                    <tr>
                      <td className="metric-label">Median Salary</td>
                      {comparisonData.map(career => (
                        <td key={career.id}>
                          <strong>{career.medianSalary || 'N/A'}</strong>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Education */}
                    <tr>
                      <td className="metric-label">Education</td>
                      {comparisonData.map(career => (
                        <td key={career.id}>
                          {career.education || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              {insightsData && (
                <div className="comparison-summary">
                  <h3>Key Insights from Backend</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <div className="insight-icon">💰</div>
                      <div className="insight-content">
                        <h4>Highest Salary</h4>
                        <p className="insight-value">
                          {insightsData.highestSalary?.career || 'N/A'}
                        </p>
                        <p className="insight-subtext">
                          {insightsData.highestSalary?.salary || ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-icon">📈</div>
                      <div className="insight-content">
                        <h4>Fastest Growing</h4>
                        <p className="insight-value">
                          {insightsData.fastestGrowing?.career || 'N/A'}
                        </p>
                        <p className="insight-subtext">
                          {insightsData.fastestGrowing?.growth || ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-icon">🎓</div>
                      <div className="insight-content">
                        <h4>Education Summary</h4>
                        <p className="insight-value">
                          {insightsData.educationSummary || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Export Options */}
              <div className="export-options">
                <button className="export-btn" onClick={() => window.print()}>
                  📄 Export as PDF
                </button>
                <button className="export-btn" onClick={() => alert('Feature coming soon!')}>
                  📧 Share Results
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerComparisonTool;