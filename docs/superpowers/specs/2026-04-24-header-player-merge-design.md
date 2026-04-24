# HeaderPlayer Component Merge Design

**Date**: 2026-04-24  
**Purpose**: Merge Header.vue and RadioPlayer.vue into unified HeaderPlayer.vue component with cohesive blur background

## Context

Currently, Header.vue and RadioPlayer.vue are two separate sticky components positioned sequentially at the top of the viewport:
- **Header.vue**: Sticky at `top: 0`, height `10vh` - contains logo and navigation
- **RadioPlayer.vue**: Sticky at `top: 10vh`, height `9vh` - contains audio controls and track info

Both components use similar blur effects (`backdrop-filter: blur(12px)`) and transparent backgrounds, but as separate elements they create visual fragmentation. Merging them will create a unified 19vh header with a single cohesive blur background.

## Requirements

### Functional Requirements
- Maintain all existing functionality from both components
- Preserve audio streaming, navigation, scroll detection, and mobile navigation
- Keep responsive behavior and mobile-specific layouts
- Maintain integration with useNowPlaying composable and MobileNavigation component

### Visual Requirements  
- Single unified blur background across the full 19vh header
- Seamless visual integration between logo/navigation and player sections
- Preserve existing typography, spacing, and interactive states

### Technical Requirements
- Create new HeaderPlayer.vue component replacing both existing components
- No new dependencies or breaking changes to existing functionality
- Clean component architecture suitable for long-term maintenance

## Architecture Design

### Component Structure
```
HeaderPlayer.vue (19vh total height, sticky top: 0)
├── .header-section (10vh) - Logo + Navigation 
│   ├── .header-inner - Logo + Nav links (desktop only)
│   └── Router navigation (hidden on mobile)
└── .player-section (9vh) - Audio controls + Track info
    ├── .player-controls - Play/pause button + track display  
    └── .mobile-more-btn - Navigation trigger (mobile only)
```

### State Management
The component will merge reactive state from both source components:

**From Header.vue:**
- `scrolled` ref for scroll state detection
- `onScroll` event handler and lifecycle management

**From RadioPlayer.vue:**
- Audio state: `isPlaying`, `isLoading`, `isError`, `volume`, `isMuted`
- Mobile navigation: `showMobileNav` 
- Audio instance management: `howl` variable
- All audio control functions: `togglePlay`, `initHowler`, `handleStreamError`, etc.

**Shared Dependencies:**
- `useNowPlaying()` composable for track information
- `MobileNavigation` component (conditional mobile rendering)
- `LucideIcon` for play/pause and navigation icons
- Vue Router for navigation links and active states

## Responsive Behavior

### Desktop Layout (>720px)
- Full 19vh unified header with navigation visible
- Logo and navigation links in top section
- Player controls and track info in bottom section  
- No mobile navigation button

### Mobile Layout (≤720px)
- Logo section: Centered logo only (navigation hidden via `display: none`)
- Player section: Horizontal layout with play button + track info + mobile "more" button
- MobileNavigation popup triggered by more button
- Maintains 19vh total height for visual consistency

## Blur Effect Implementation

### Unified Background
```css
.header-player {
  position: sticky;
  top: 0;
  height: 19vh;
  width: 100%;
  z-index: 998;
  
  /* Single unified blur background */
  background-color: rgba(244, 241, 241, 0.05);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(70, 69, 69, 0.95);
}
```

### Visual Integration
- No visual separator between header and player sections (seamless blend)
- Internal layout uses flexbox column structure
- Optional scroll state enhancement with darker background
- Maintains existing font weights, colors, and spacing from both components

## Implementation Plan

### File Changes
1. **Create**: `src/components/HeaderPlayer.vue` (new merged component)
2. **Update**: `src/App.vue` (replace Header + RadioPlayer imports with single HeaderPlayer)
3. **Remove**: `src/components/Header.vue` and `src/components/RadioPlayer.vue`

### App.vue Integration
```vue
<template>
  <div id="app">
    <HeaderPlayer /> <!-- Single import replaces both -->
    <main class="main-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import HeaderPlayer from './components/HeaderPlayer.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>
```

### Component Implementation Strategy
1. Start with HeaderPlayer.vue template structure (two-section layout)
2. Merge `<script setup>` sections, combining all imports and reactive state
3. Combine CSS styles with unified blur container
4. Test all functionality: audio, navigation, mobile behavior, scroll detection
5. Update App.vue imports
6. Remove original component files after verification

## Testing & Verification

### Functionality Testing
- Audio streaming works identically to current implementation
- Navigation links and routing function without changes
- Mobile navigation popup operates correctly
- Scroll detection and blur state changes work
- MediaSession integration preserved for lock screen controls

### Responsive Testing  
- Desktop layout displays navigation and player correctly
- Mobile layout hides navigation and shows mobile menu button
- Breakpoint transitions work smoothly
- Touch targets meet minimum 44px accessibility requirements

### Integration Testing
- No conflicts with existing components or pages
- useNowPlaying composable integration maintained
- MobileNavigation component renders properly
- Performance equivalent or improved versus separate components

## Risk Mitigation

### Rollback Strategy
- Original Header.vue and RadioPlayer.vue preserved in git history
- Can revert to separate components if critical issues arise
- Implementation can be done incrementally with testing at each step

### Code Quality
- Maintain existing patterns and conventions
- Preserve all existing functionality without modification
- No new dependencies or breaking changes
- Clean separation of concerns within merged component

## Success Criteria

1. **Visual**: Single cohesive blur background spans full 19vh header
2. **Functional**: All existing features work identically 
3. **Performance**: No regression in audio or UI responsiveness
4. **Maintainable**: Clean component architecture suitable for future development
5. **Mobile**: Responsive behavior matches existing mobile experience