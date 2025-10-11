# Project Structure

## Root Level
- `index.html` - Main HTML entry point
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite build configuration
- `eslint.config.js` - ESLint rules and configuration
- `README.md` - Project documentation

## Source Directory (`src/`)
```
src/
├── main.jsx          # Application entry point
├── App.jsx           # Main application component
├── App.css           # Main application styles
├── index.css         # Global styles
├── resumeData.json   # Resume content data
├── components/       # Reusable React components
└── assets/           # Static assets
```

## Component Organization
Each component follows the pattern:
- `ComponentName.jsx` - React component
- `ComponentName.css` - Component-specific styles

Current components:
- `Sidebar.jsx` - Navigation sidebar
- `Section.jsx` - Generic content section with multiple variants
- `ExperienceSection.jsx` - Specialized section for work experience

## Data Structure
- Resume content is centralized in `src/resumeData.json`
- JSON structure includes: about, experience, skills, education, certifications, contact
- Components receive data as props from the main App component

## Styling Approach
- Component-scoped CSS files
- Global styles in `index.css`
- App-level styles in `App.css`
- CSS class naming follows kebab-case convention

## Key Patterns
- Data-driven components that accept configuration via props
- Reusable Section component with different display variants (tags, cards, default)
- Centralized data management through JSON configuration
- Responsive design with sidebar navigation