# Implementation Plan

- [x] 1. Create API service module for counterapi.dev integration





  - Create `src/services/counterService.js` with async function to fetch and increment visitor count
  - Implement proper error handling and 5-second timeout for API requests
  - Use the counterapi.dev v2 endpoint: `https://api.counterapi.dev/v2/AshwinResumeVisitCounter/resume/up`
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 4.4_

- [ ]* 1.1 Write unit tests for counter service
  - Create test file for API service with mocked fetch responses
  - Test successful API calls, network failures, timeouts, and invalid responses
  - _Requirements: 1.3, 3.4_

- [x] 2. Create VisitorCounter React component





  - Create `src/components/VisitorCounter.jsx` with state management for count, loading, and error states
  - Implement useEffect hook to fetch visitor count on component mount
  - Handle all error states gracefully without displaying errors to users
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 2.4, 4.1, 4.2_

- [x] 2.1 Add component styling


  - Create `src/components/VisitorCounter.css` with subtle, professional styling
  - Position counter at bottom of sidebar using margin-top: auto
  - Implement responsive design for mobile horizontal navigation
  - Use existing design tokens and maintain visual hierarchy
  - _Requirements: 2.1, 2.2, 4.3_

- [ ]* 2.2 Write component unit tests
  - Test component rendering in loading, success, and error states
  - Verify API service integration and error handling
  - Test responsive behavior and accessibility features
  - _Requirements: 1.3, 2.4, 4.1_

- [x] 3. Integrate VisitorCounter into Sidebar component





  - Import and add VisitorCounter component to `src/components/Sidebar.jsx`
  - Position counter at the bottom of the sidebar navigation
  - Ensure proper CSS flexbox layout to push counter to bottom
  - _Requirements: 2.1, 2.2, 4.3_

- [x] 4. Update Sidebar CSS for counter positioning





  - Modify `src/components/Sidebar.css` to use flexbox layout for proper counter positioning
  - Add responsive styles for mobile horizontal navigation integration
  - Ensure counter doesn't interfere with existing navigation styling
  - _Requirements: 2.1, 2.2, 4.3_

- [ ]* 5. Add integration tests
  - Create integration test to verify full visitor counter workflow
  - Test component integration within sidebar and app context
  - Verify performance impact and loading behavior
  - _Requirements: 4.1, 4.2, 4.4_