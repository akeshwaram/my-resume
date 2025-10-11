# Experience Section Simplification

## Changes Made

### Removed ExperienceSection Component
- **Eliminated**: Completely removed the custom ExperienceSection.jsx component
- **Replaced with**: Regular Section component using new "experience" variant
- **Simplified imports**: No longer importing ExperienceSection in App.jsx

### New Experience Layout

#### Data Transformation
```jsx
// Old: Custom ExperienceSection with items prop
<ExperienceSection items={resumeData?.experience?.list || []} />

// New: Regular Section with mapped data
<Section
  variant="experience"
  list={experience.map(exp => ({
    title: exp.role,
    sub: exp.company,
    meta: `${exp.period}${exp.location ? ' • ' + exp.location : ''}`,
    description: exp.summary,
    highlights: exp.highlights || []
  }))}
/>
```

#### Simple HTML Structure
```html
<div class="experience-simple-item">
  <div class="experience-simple-header">
    <strong>Senior Software Engineer</strong> at Fincentric
  </div>
  <div>Sep 2020 – Dec 2024 • Denver, CO, USA</div>
  <div>Summary text...</div>
  <ul>
    <li>Highlight 1</li>
    <li>Highlight 2</li>
  </ul>
</div>
```

### Benefits

#### Eliminated Complex CSS
- **Removed**: ~150 lines of experience-specific CSS
- **No more**: Card-based layouts, hover effects, complex animations
- **Simplified**: Plain HTML with minimal styling

#### Consistent Layout System
- **Unified approach**: All sections now use the same Section component
- **Same styling**: Consistent borders, spacing, and typography
- **Easier maintenance**: Single component to manage

#### Better Performance
- **Smaller bundle**: CSS reduced from 33.25 kB to 29.89 kB (10% reduction)
- **Fewer components**: Removed entire ExperienceSection component
- **Simpler rendering**: Plain HTML renders faster than complex cards

### Expected Visual Result

#### Experience Entry Format
```
Senior Software Engineer at Fincentric
Sep 2020 – Dec 2024 • Denver, CO, USA

Proven Software Engineer with 15+ years of hands-on experience...

• Led development for a website with 27 regions, 31 languages...
• Created a dashboard to monitor client's fund data...
• Implemented custom pipelines to meet unique needs...
```

#### Key Features
- **Clean hierarchy**: Job title and company clearly displayed
- **Essential info**: Period and location on separate line
- **Summary included**: Job description when available
- **Bullet points**: Highlights displayed as simple list items
- **Minimal spacing**: Compact but readable layout

### Technical Improvements

#### Code Reduction
- **Removed files**: ExperienceSection.jsx, ExperienceSection.css
- **Simplified imports**: One less component to import
- **Unified logic**: All list-based content uses same component

#### Maintainability
- **Single source**: All section layouts in one component
- **Consistent styling**: Same CSS patterns across all sections
- **Easier updates**: Changes apply to all sections uniformly

The experience section now uses the same ultra-simple approach as other sections, eliminating all card-based complexity while maintaining clear presentation of work history information.