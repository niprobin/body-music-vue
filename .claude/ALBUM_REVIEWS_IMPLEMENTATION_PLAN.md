# Album Reviews Feature - Implementation Plan

## Overview

Add album review functionality to Body Music Radio, allowing detailed reviews for select albums while maintaining the existing albums collection. Reviews will be statically generated at build time for optimal SEO and performance.

## Project Context

- **Framework**: Vue 3 (Composition API) + Vite
- **Deployment**: Vercel
- **Data Source**: n8n webhook (merges Google Sheets data)
- **Existing Route**: `/albums` (displays album grid, links to Discogs)

## Feature Requirements

### User Flow

1. User visits `/albums` page (existing)
2. Albums WITH reviews → clickable, navigate to `/albums/[slug]` (new)
3. Albums WITHOUT reviews → clickable, open Discogs URL (existing behavior)
4. Individual review pages show: album metadata, cover art, full review text, link to Discogs

### Data Structure

Albums will have a `has_review` boolean flag from n8n webhook.

**Album object (from n8n):**

```javascript
{
  id: "md5-hash",           // MD5 of album+artist
  release_name: "string",
  release_date: "YYYY-MM-DD",
  cover_url: "https://...",
  genre: "string",
  discogs_url: "https://...",
  has_review: boolean,      // NEW: flag from n8n
  text: "string"            // Only present if has_review=true
  slug: "string"            // only present if has_review=true
}
```

## Implementation Steps

### Phase 1: n8n Webhook Integration

**Task 1.1: Update data fetching**

- Existing endpoint to fetch album data now include
  - `has_review` field
  - `text` field (the review itself - with line breaks)
  - `slug` field (generate clean SEO urls)

**Files to modify:**

- `src/pages/Albums.vue` (update fetch call)

### Phase 2: Static Site Generation Setup

**Task 2.1: Install vite-ssg**

```bash
npm install vite-ssg
```

**Task 2.2: Configure vite-ssg**

- Create `src/main-ssg.js` (SSG entry point)
- Modify `vite.config.js` to support SSG
- Update `package.json` build script

**New files:**

- `src/main-ssg.js`

**Files to modify:**

- `vite.config.js`
- `package.json`

**Task 2.3: Add build-time data fetching**

- Create utility function to fetch albums data during build
- Store data for static page generation
- Implement in SSG context

**New files:**

- `src/utils/buildData.js` (or similar)

### Phase 3: Router Configuration

**Task 3.1: Add dynamic route**

- Add `/albums/:slug` route to Vue Router
- Configure route meta for SSG
- Implement dynamic route generation from albums data

**Files to modify:**

- `src/router/index.js`

**Example router addition:**

```javascript
{
  path: '/albums/:slug',
  name: 'AlbumReview',
  component: () => import('../pages/AlbumReview.vue')
}
```

### Phase 4: Component Development

**Task 4.1: Update Albums.vue (list page)**

- Add conditional rendering for album cards
- IF `has_review === true`: render `<router-link>` to `/albums/[slug]`
- IF `has_review === false`: render `<a>` to `discogs_url` (existing)
- Add visual indicator for reviewed albums (optional: badge/icon)

**Files to modify:**

- `src/pages/Albums.vue`

**Task 4.2: Create AlbumReview.vue (detail page)**

- New page component for individual reviews
- Display album metadata (title, artist, date, genre, cover)
- Display review text with proper formatting
- Add link to Discogs page
- Add "Back to Albums" navigation
- Responsive mobile-first design matching existing style

**New files:**

- `src/pages/AlbumReview.vue`

**Component structure:**

```vue
<template>
  <div class="album-review">
    <div class="review-header">
      <img :src="album.cover_url" :alt="album.release_name" />
      <h1>{{ album.release_name }}</h1>
      <div class="metadata">
        <span>{{ album.release_date }}</span>
        <span>{{ album.genre }}</span>
      </div>
    </div>
    <div class="review-content">
      <p>{{ album.text }}</p>
    </div>
    <div class="review-footer">
      <a :href="album.discogs_url" target="_blank">View album</a>
      <router-link to="/albums">← Back to Albums</router-link>
    </div>
  </div>
</template>
```

### Phase 5: SEO Optimization

**Task 5.1: Add meta tags**

- Install `@unhead/vue` (or use existing meta solution)
- Add dynamic meta tags per review page:
  - `<title>`: Album name + artist
  - `<meta name="description">`: First 150 chars of review
  - Open Graph tags for social sharing
  - Canonical URLs

**Files to modify:**

- `src/pages/AlbumReview.vue`

**Task 5.2: Generate sitemap**

- Add sitemap generation at build time
- Include all review URLs
- Configure in Netlify deployment

### Phase 6: Styling

**Task 6.1: Style review pages**

- Match existing Body Music Radio design aesthetic
- Use Inter font (already loaded)
- Mobile-first responsive design
- Ensure readability for long review text
- Style metadata display
- Add hover states for interactive elements

**Files to modify:**

- `src/pages/AlbumReview.vue` (scoped styles)
- Global styles if needed

### Phase 7: Build & Deploy

**Task 7.1: Update Netlify configuration**

- Modify build command to use SSG
- Configure redirects if needed
- Test build locally first

**Files to modify:**

- `Vercel functions (if needed, I don't know)

**Task 7.2: Testing checklist**

- [ ] Albums without reviews still link to Discogs
- [ ] Albums with reviews navigate to `/albums/[slug]`
- [ ] Review pages render correctly on mobile
- [ ] Meta tags appear in page source
- [ ] Back navigation works
- [ ] Build completes successfully
- [ ] All static pages generated
- [ ] PWA still functions correctly

## Technical Considerations

### Build Performance

- Albums data fetched ONCE at build time (not per-page)
- Only albums with `has_review: true` generate static pages
- Consider caching n8n webhook response during build

### URL Structure

- Clean URLs: `/albums/miles-davis-kind-of-blue` (using the slug)

### Error Handling

- Handle missing album data gracefully
- 404 page for invalid album IDs
- Fallback if n8n webhook fails during build

### Future Enhancements (Post-MVP)

- Add search/filter on reviews page
- Sort reviews by date, genre, rating
- Add "Related Albums" section
- Implement comments (if desired)
- RSS feed for new reviews

## File Checklist

### New Files

- [ ] `src/main-ssg.js`
- [ ] `src/pages/AlbumReview.vue`
- [ ] `src/utils/buildData.js` (optional)

### Modified Files

- [ ] `src/pages/Albums.vue`
- [ ] `src/router/index.js`
- [ ] `vite.config.js`
- [ ] `package.json`
- [ ] `netlify.toml`

## Dependencies to Install

```bash
npm install vite-ssg
npm install @unhead/vue  # if not already installed
```

## Deployment Steps

1. Implement Phase 1-6 locally
2. Test build: `npm run build`
3. Test preview: `npm run preview`
4. Commit changes to Git
5. Push to GitHub
6. Netlify auto-deploys
7. Verify production build

## Rollback Plan

If issues arise:

- n8n webhook still returns old data structure (just albums)
- Frontend gracefully handles missing `has_review` field (defaults to false)
- All albums continue linking to Discogs until reviews are ready

## Success Metrics

- ✅ Review pages accessible at `/albums/[slug]`
- ✅ Clean URLs in browser and search results
- ✅ Pages render as static HTML (view source shows content)
- ✅ Mobile-responsive design
- ✅ SEO meta tags present
- ✅ Build time remains reasonable (<2 min)
- ✅ Existing albums functionality unchanged

## Questions for Implementation

- [ ] Visual indicator for reviewed albums (badge, icon, color)?
- [ ] Review text formatting: plain text or support markdown?
- [ ] Add "Last Updated" date to reviews?
- [ ] Include genre/date filters on main albums page?
