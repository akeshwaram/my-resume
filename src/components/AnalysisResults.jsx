import React from "react";
import "./AnalysisResults.css";

export default function AnalysisResults({ score, strengths, gaps, recommendations, onNewAnalysis }) {
  // Determine color based on score range
  const getScoreColor = (score) => {
    if (score >= 0 && score <= 40) return "red";
    if (score >= 41 && score <= 70) return "yellow";
    if (score >= 71 && score <= 100) return "green";
    return "gray";
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="analysis-results">
      {/* Score Display */}
      <div className="score-container">
        <div className={`score-display score-${scoreColor}`}>
          <div className="score-value">{Math.round(score)}</div>
          <div className="score-label">Suitability Score</div>
        </div>
      </div>

      {/* Feedback Sections */}
      <div className="feedback-sections">
        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div className="feedback-section strengths-section">
            <h3 className="feedback-title">
              <span className="feedback-icon">✓</span>
              Strengths
            </h3>
            <ul className="feedback-list">
              {strengths.map((strength, index) => (
                <li key={index} className="feedback-item">{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps */}
        {gaps && gaps.length > 0 && (
          <div className="feedback-section gaps-section">
            <h3 className="feedback-title">
              <span className="feedback-icon">!</span>
              Gaps
            </h3>
            <ul className="feedback-list">
              {gaps.map((gap, index) => (
                <li key={index} className="feedback-item">{gap}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="feedback-section recommendations-section">
            <h3 className="feedback-title">
              <span className="feedback-icon">→</span>
              Recommendations
            </h3>
            <ul className="feedback-list">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="feedback-item">{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* New Analysis Button */}
      <div className="actions-container">
        <button 
          className="new-analysis-button" 
          onClick={onNewAnalysis}
          type="button"
        >
          New Analysis
        </button>
      </div>
    </div>
  );
}
