import React, { useState, useEffect } from 'react';
import { fetchVisitorCount } from '../services/counterService.js';
import './VisitorCounter.css';

/**
 * VisitorCounter component that displays the website visitor count
 * Fetches count from counterapi.dev and handles all error states gracefully
 */
export default function VisitorCounter() {
  const [count, setCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('VisitorCounter useEffect triggered');
    
    // Check if we've already incremented the counter in this session
    const sessionKey = 'visitor-counter-incremented';
    const hasIncrementedThisSession = sessionStorage.getItem(sessionKey);
    
    console.log('Has incremented this session:', hasIncrementedThisSession);
    
    const loadVisitorCount = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        if (!hasIncrementedThisSession) {
          console.log('First time this session - incrementing counter');
          // Mark that we've incremented in this session before making the API call
          sessionStorage.setItem(sessionKey, 'true');
          const visitorCount = await fetchVisitorCount();
          console.log('Received visitor count:', visitorCount);
          setCount(visitorCount);
        } else {
          console.log('Already incremented this session - just fetching current count');
          // Use the non-incrementing endpoint to just get the current count
          const response = await fetch('https://y5495ve97i.execute-api.ap-south-1.amazonaws.com/dev/counter', {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Read-only API response:', data);
            
            // Handle different response formats
            let currentCount;
            if (data && typeof data.Count === 'number') {
              currentCount = data.Count;
            } 
            else {
              throw new Error('Invalid response format from read-only API');
            }
            
            console.log('Current count (no increment):', currentCount);
            setCount(currentCount);
          } else {
            throw new Error('Failed to fetch current count');
          }
        }
      } catch (error) {
        console.error('Failed to fetch visitor count:', error.message);
        setHasError(true);
        setCount(null);
        // Don't reset session storage on error - keep the increment flag
      } finally {
        setIsLoading(false);
      }
    };

    loadVisitorCount();
  }, []);

  // Show loading state for testing positioning
  if (isLoading) {
    return (
      <div className="visitor-counter">
        <span className="visitor-counter__label">You are visitor #</span>
        <span className="visitor-counter__count">Loading...</span>
      </div>
    );
  }

  // Show error state for testing positioning
  if (hasError || count === null) {
    return (
      <div className="visitor-counter">
        <span className="visitor-counter__label">You are visitor #</span>
        <span className="visitor-counter__count">---</span>
      </div>
    );
  }

  return (
    <div className="visitor-counter">
      <span className="visitor-counter__label">You are visitor #</span>
      <span className="visitor-counter__count">{count.toLocaleString()}</span>
    </div>
  );
}