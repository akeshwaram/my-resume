# Technology Stack

## Build System & Framework
- **Vite** - Modern build tool and dev server
- **React 19.1.1** - Frontend framework with React DOM
- **ES Modules** - Modern JavaScript module system

## Development Tools
- **ESLint** - Code linting with React-specific rules
- **@vitejs/plugin-react** - Vite plugin for React Fast Refresh

## Code Style & Linting
- ESLint configuration includes:
  - React Hooks rules (`eslint-plugin-react-hooks`)
  - React Refresh rules (`eslint-plugin-react-refresh`)
  - Custom rule: unused vars allowed if they match pattern `^[A-Z_]`
- ECMAScript 2020+ features supported
- JSX syntax enabled

## Common Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## File Extensions
- Use `.jsx` for React components
- Use `.js` for utility files and configuration
- Use `.css` for styling (component-specific CSS files preferred)

## Dependencies
- Minimal dependency footprint - only React and development tools
- No additional UI libraries or frameworks