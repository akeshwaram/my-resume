import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";
import AnalysisResults from "./AnalysisResults.jsx";
import "./ResumeMatcherSection.css";

export default function ResumeMatcherSection({ resumeData }) {
  const [jobTitle, setJobTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [cachedResults, setCachedResults] = useState({});

  const MIN_CHARS = 2;
  const MAX_CHARS = 50;
  
  const presetRoles = [
    "Technical Architect",
    "Solutions Architect", 
    "Engineering Manager"
  ];

  // Load cached results from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('roleMatchCache');
    if (cached) {
      try {
        setCachedResults(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached results');
      }
    }
  }, []);

  // Validation helper
  const getValidationError = () => {
    if (jobTitle.length === 0) return null;
    if (jobTitle.length < MIN_CHARS) {
      return `Job title must be at least ${MIN_CHARS} characters (currently ${jobTitle.length})`;
    }
    if (jobTitle.length > MAX_CHARS) {
      return `Job title must not exceed ${MAX_CHARS} characters (currently ${jobTitle.length})`;
    }
    return null;
  };

  const validationError = getValidationError();
  const isValid = jobTitle.length >= MIN_CHARS && jobTitle.length <= MAX_CHARS;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) return;

    // Check cache first
    const cacheKey = jobTitle.toLowerCase().trim();
    if (cachedResults[cacheKey]) {
      setResult(cachedResults[cacheKey]);
      return;
    }

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
          jobTitle,
          resumeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Cache the result
      const newCache = { ...cachedResults, [cacheKey]: data };
      setCachedResults(newCache);
      localStorage.setItem('roleMatchCache', JSON.stringify(newCache));
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle preset chip click
  const handlePresetClick = (role) => {
    setJobTitle(role);
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    setJobTitle("");
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
      <div className="section-title-wrapper">
        <span className="ai-icon">✨</span>
        <h2 className="gradient-title">Role Compatibility Check</h2>
      </div>
      <p className="section-description">
        Curious how well my experience aligns with a specific role? Enter a job title below and let AI evaluate the match.
        <button 
          className="info-link"
          onClick={() => setShowInfoModal(true)}
          type="button"
        >
          What's analyzed?
        </button>
      </p>

      {!result && !isAnalyzing && (
        <form onSubmit={handleSubmit} className="job-matcher-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="job-title" className="form-label">
                Target Role
              </label>
              <input
                type="text"
                id="job-title"
                className={`job-title-input ${validationError && jobTitle.length > 0 ? "input-error" : ""}`}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Solutions Architect"
                maxLength={50}
                disabled={isAnalyzing}
              />
              {validationError && jobTitle.length > 0 && (
                <div className="validation-error">{validationError}</div>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={!isValid || isAnalyzing}
            >
              Check Fit
            </button>
          </div>

          <div className="preset-chips">
            {presetRoles.map((role) => (
              <button
                key={role}
                type="button"
                className="preset-chip"
                onClick={() => handlePresetClick(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </form>
      )}
      
      {showInfoModal && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>What's Analyzed?</h3>
            <p>The AI evaluates your profile against the target role by analyzing:</p>
            <ul>
              <li><strong>Skills:</strong> Technical and soft skills match</li>
              <li><strong>Experience:</strong> Relevant work history and projects</li>
              <li><strong>Certifications:</strong> Professional credentials</li>
              <li><strong>Education:</strong> Academic background</li>
            </ul>
            <button className="modal-close" onClick={() => setShowInfoModal(false)}>
              Close
            </button>
          </div>
        </div>
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
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </section>
  );
}
