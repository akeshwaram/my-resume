import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";
import AnalysisResults from "./AnalysisResults.jsx";
import "./ResumeMatcherSection.css";

export default function ResumeMatcherSection({ resumeData }) {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const MIN_CHARS = 50;
  const MAX_CHARS = 5000;

  // Validation helper
  const getValidationError = () => {
    if (jobDescription.length === 0) return null;
    if (jobDescription.length < MIN_CHARS) {
      return `Job description must be at least ${MIN_CHARS} characters (currently ${jobDescription.length})`;
    }
    if (jobDescription.length > MAX_CHARS) {
      return `Job description must not exceed ${MAX_CHARS} characters (currently ${jobDescription.length})`;
    }
    return null;
  };

  const validationError = getValidationError();
  const isValid = jobDescription.length >= MIN_CHARS && jobDescription.length <= MAX_CHARS;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) {
        throw new Error("API URL is not configured. Please set VITE_API_URL environment variable.");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    setJobDescription("");
    setResult(null);
    setError(null);
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <section id="resume-matcher" className="resume-matcher-section">
      <h2>AI Job Match</h2>
      <p className="section-description">
        Enter a job description below to see how well this candidate's profile matches the role.
      </p>

      {!result && !isAnalyzing && (
        <form onSubmit={handleSubmit} className="job-matcher-form">
          <div className="form-group">
            <label htmlFor="job-description" className="form-label">
              Job Description
            </label>
            <textarea
              id="job-description"
              className={`job-description-input ${validationError && jobDescription.length > 0 ? "input-error" : ""}`}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here (minimum 50 characters)..."
              rows={10}
              disabled={isAnalyzing}
            />
            <div className="input-footer">
              <div className="character-count">
                {jobDescription.length}/{MAX_CHARS}
              </div>
              {validationError && jobDescription.length > 0 && (
                <div className="validation-error">{validationError}</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!isValid || isAnalyzing}
          >
            Analyze Match
          </button>
        </form>
      )}

      {isAnalyzing && (
        <LoadingSpinner message="Analyzing job match..." />
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="retry-button"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}

      {result && (
        <AnalysisResults
          score={result.score}
          strengths={result.strengths}
          gaps={result.gaps}
          recommendations={result.recommendations}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </section>
  );
}
