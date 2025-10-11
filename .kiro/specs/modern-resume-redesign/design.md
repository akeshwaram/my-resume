# Design Document

## Overview

This design transforms the existing resume website into a modern, bold, and clean interface while maintaining the current React architecture and data-driven approach. The redesign focuses on creating a striking visual hierarchy, improved typography, and a contemporary color palette using CSS variables for maintainability.

## Architecture

### Design System Foundation
The redesign will be built on a comprehensive CSS variable system that defines:
- **Color Palette**: Modern, bold colors with high contrast ratios
- **Typography Scale**: Harmonious font sizes and weights
- **Spacing System**: Consistent spacing units for layout
- **Component Tokens**: Reusable design elements

### Current Architecture Preservation
- Maintain existing React component structure (Sidebar, Section, ExperienceSection)
- Keep data-driven approach with resumeData.json
- Preserve responsive grid layout and mobile-first design
- Retain current build system and dependencies

## Components and Interfaces

### 1. Design Token System (CSS Variables)

**Color Palette - Modern & Bold**
```css
:root {
  /* Primary Colors - Deep, sophisticated tones */
  --color-primary: #0f172a;      /* Rich navy for headers */
  --color-secondary: #1e293b;    /* Slate for secondary text */
  --color-accent: #3b82f6;       /* Vibrant blue for links/highlights */
  --color-accent-hover: #2563eb; /* Darker blue for interactions */
  
  /* Background Colors - Clean, layered approach */
  --color-bg-primary: #ffffff;   /* Pure white main background */
  --color-bg-secondary: #f8fafc; /* Subtle gray for contrast */
  --color-bg-tertiary: #f1f5f9;  /* Lighter gray for cards */
  
  /* Text Colors - High contrast hierarchy */
  --color-text-primary: #0f172a;   /* Main text */
  --color-text-secondary: #475569; /* Secondary text */
  --color-text-muted: #64748b;     /* Muted text */
  --color-text-inverse: #ffffff;   /* White text for dark backgrounds */
  
  /* Border & Divider Colors */
  --color-border-light: #e2e8f0;
  --color-border-medium: #cbd5e1;
  --color-border-strong: #94a3b8;
  
  /* Status & Accent Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

**Typography Scale**
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Font Sizes - Modular scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

**Spacing & Layout**
```css
:root {
  /* Spacing Scale - 8px base unit */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;  /* Fully rounded */
  
  /* Shadows - Layered depth */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### 2. Sidebar Component Redesign

**Visual Enhancements:**
- **Bold Typography**: Larger, bolder name/logo with modern font weight
- **Gradient Background**: Subtle gradient from dark navy to deep slate
- **Enhanced Navigation**: Improved hover states with smooth transitions
- **Modern Indicators**: Active state indicators with accent color
- **Refined Mobile Experience**: Cleaner horizontal scroll with better visual cues

**Key Features:**
- Sticky positioning maintained for desktop and mobile
- Smooth color transitions on hover/active states
- Improved contrast ratios for accessibility
- Modern scrollbar styling for mobile horizontal navigation

### 3. Section Component Redesign

**Visual Hierarchy:**
- **Bold Section Headers**: Larger, bolder typography with accent color
- **Improved Spacing**: More generous whitespace for better readability
- **Modern Cards**: Enhanced card design with subtle shadows and borders
- **Better Content Flow**: Improved line-height and text spacing

**Card System Enhancements:**
- Subtle hover effects with elevation changes
- Better visual separation between content types
- Improved tag styling with modern pill design
- Enhanced link styling with better visual feedback

### 4. Typography System

**Heading Hierarchy:**
- H1: Bold, large (--text-4xl) for main name/title
- H2: Semi-bold, medium (--text-2xl) for section headers
- H3: Medium weight (--text-xl) for subsection headers
- Body: Regular weight (--text-base) with improved line-height

**Text Treatments:**
- **Primary Text**: High contrast, easy to read
- **Secondary Text**: Reduced opacity for hierarchy
- **Accent Text**: Bold color for important information
- **Meta Text**: Smaller, muted for supporting information

## Data Models

### Design Token Structure
The CSS variables will be organized into logical groups:

```css
:root {
  /* Colors */
  --color-*: /* Color palette */
  
  /* Typography */
  --font-*: /* Font families */
  --text-*: /* Font sizes */
  --font-*: /* Font weights */
  --leading-*: /* Line heights */
  
  /* Spacing */
  --space-*: /* Spacing scale */
  --radius-*: /* Border radius */
  
  /* Effects */
  --shadow-*: /* Box shadows */
  --transition-*: /* Animation timings */
}
```

### Component Variants
Each component will support multiple visual variants:
- **Section variants**: default, featured, compact
- **Card variants**: default, elevated, bordered
- **Tag variants**: default, accent, muted

## Error Handling

### CSS Fallbacks
- Provide fallback values for all CSS custom properties
- Use progressive enhancement for advanced features
- Ensure graceful degradation on older browsers

### Responsive Breakpoints
- Maintain existing breakpoint system
- Ensure all new styles work across device sizes
- Test typography scaling on various screen sizes

## Testing Strategy

### Visual Regression Testing
- Compare before/after screenshots of all sections
- Test responsive behavior at key breakpoints
- Verify color contrast ratios meet accessibility standards

### Cross-Browser Compatibility
- Test CSS variable support across browsers
- Verify fallback styles work correctly
- Test mobile scrolling and sticky positioning

### Performance Considerations
- Minimize CSS bundle size impact
- Optimize for paint and layout performance
- Ensure smooth animations and transitions

### Accessibility Testing
- Verify color contrast ratios (minimum 4.5:1 for normal text)
- Test keyboard navigation functionality
- Ensure screen reader compatibility

## Implementation Approach

### Phase 1: Design System Foundation
1. Update CSS variables in index.css with new design tokens
2. Create utility classes for common patterns
3. Test variable system across components

### Phase 2: Component Updates
1. Update Sidebar component with new styling
2. Enhance Section component with modern design
3. Improve card and tag styling
4. Update typography throughout

### Phase 3: Responsive Refinements
1. Optimize mobile experience
2. Enhance tablet layout
3. Fine-tune desktop presentation
4. Test across devices and browsers

### Phase 4: Polish and Optimization
1. Add subtle animations and transitions
2. Optimize performance
3. Final accessibility review
4. Cross-browser testing

## Design Rationale

### Color Choices
- **Deep Navy Primary**: Conveys professionalism and sophistication
- **Vibrant Blue Accent**: Modern, trustworthy, and energetic
- **High Contrast Text**: Ensures excellent readability
- **Layered Backgrounds**: Creates visual depth without distraction

### Typography Decisions
- **Inter Font**: Modern, highly legible, professional appearance
- **Modular Scale**: Consistent visual hierarchy
- **Improved Line Heights**: Better readability and visual flow
- **Bold Weights**: Creates strong visual hierarchy

### Layout Philosophy
- **Generous Whitespace**: Allows content to breathe
- **Clear Visual Hierarchy**: Guides user attention effectively
- **Consistent Spacing**: Creates visual rhythm and harmony
- **Modern Card Design**: Clean, elevated appearance without clutter