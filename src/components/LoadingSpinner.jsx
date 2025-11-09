import './LoadingSpinner.css';

function LoadingSpinner({ message = "Analyzing..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner" role="status" aria-live="polite">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
