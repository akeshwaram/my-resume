# Design Document

## Overview

The visitor counter feature will integrate with counterapi.dev's free tier service to track and display website visits. The counter will be implemented as a React component that fetches the current count on page load, increments it, and displays the result in a subtle location within the sidebar. The implementation prioritizes performance, graceful error handling, and maintaining the professional appearance of the resume.

## Architecture

### Component Structure
```
App.jsx
├── Sidebar.jsx
│   └── VisitorCounter.jsx (new)
└── [existing sections...]
```

### API Integration
- **Service**: counterapi.dev free tier
- **Workspace**: "AshwinResumeVisitCounter" 
- **Counter Name**: "resume"
- **Endpoint**: `https://api.counterapi.dev/v2/AshwinResumeVisitCounter/resume/up`
- **Method**: GET request that automatically increments and returns the new count

### Data Flow
1. App loads → VisitorCounter component mounts
2. VisitorCounter makes async API call to counterapi.dev
3. API increments counter and returns new value
4. Component updates state and displays count
5. Error handling ensures graceful degradation if API fails

## Components and Interfaces

### VisitorCounter Component
```jsx
// Props interface
interface VisitorCounterProps {
  className?: string;
}

// Component state
interface CounterState {
  count: number | null;
  isLoading: boolean;
  hasError: boolean;
}
```

**Responsibilities:**
- Fetch and increment visitor count on mount
- Handle loading and error states gracefully
- Display count in subtle, professional styling
- Implement timeout for API requests (5 seconds)

### API Service Module
```javascript
// api/counterService.js
export const fetchVisitorCount = async () => {
  // Returns Promise<number>
  // Throws error on failure for component to handle
}
```

**Responsibilities:**
- Encapsulate API call logic
- Handle HTTP errors and timeouts
- Return clean data interface to components

## Data Models

### API Response
```javascript
// Successful response from counterapi.dev
{
  "count": 42
}

// Error handling for various failure modes:
// - Network errors
// - API service unavailable  
// - Timeout errors
// - Invalid responses
```

### Component State
```javascript
{
  count: number | null,     // null when loading or error
  isLoading: boolean,       // true during API call
  hasError: boolean         // true if API call failed
}
```

## Error Handling

### Graceful Degradation Strategy
1. **Network Failures**: Component renders nothing, no error shown to user
2. **API Timeouts**: 5-second timeout, then silent failure
3. **Invalid Responses**: Validate response structure, fail silently if invalid
4. **Service Unavailable**: No visual indication of failure to maintain UX

### Error Boundaries
- Component-level error handling prevents crashes
- No error messages displayed to end users
- Errors logged to console for debugging (development only)

### Retry Logic
- Single attempt only to avoid performance impact
- No automatic retries to prevent API abuse
- Simple fail-fast approach for better UX

## Testing Strategy

### Unit Tests
- API service function with mocked responses
- Component rendering with different states (loading, success, error)
- Error handling scenarios
- Timeout behavior

### Integration Tests  
- Full component lifecycle with real API calls (using test workspace)
- Network failure simulation
- Performance impact measurement

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Performance on slow connections
- API service availability

## Implementation Details

### Positioning Strategy
The counter will be placed at the bottom of the sidebar navigation, styled to match the existing design system:

```css
.visitor-counter {
  margin-top: auto;           /* Push to bottom of sidebar */
  padding: var(--space-3);
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Mobile Considerations
- On mobile, counter appears at the end of horizontal navigation
- Maintains subtle styling and small font size
- No layout shifts during loading/error states

### Performance Optimizations
- Async API call doesn't block page rendering
- Component mounts after initial page load
- Minimal bundle size impact
- No external dependencies beyond fetch API

### Accessibility
- Counter text includes proper semantic meaning
- Screen reader friendly with appropriate labels
- No interactive elements (display only)
- Maintains focus flow of existing navigation

## Security Considerations

### API Security
- Using public API endpoint (no authentication required)
- No sensitive data transmitted
- Rate limiting handled by counterapi.dev service
- No user data collection or storage

### Privacy
- No personal information tracked
- Anonymous visit counting only  
- No cookies or local storage used
- Compliant with privacy best practices

## Styling Integration

### Design System Alignment
- Uses existing CSS custom properties (design tokens)
- Matches sidebar color scheme and typography
- Responsive behavior consistent with current navigation
- Subtle visual hierarchy maintains focus on resume content

### Visual Hierarchy
- Small, muted text color to avoid distraction
- Positioned at bottom of sidebar (lowest priority)
- Minimal visual weight compared to navigation items
- Professional appearance suitable for resume context