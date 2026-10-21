/**
 * Album rules shared by Home, Albums and AlbumReview.
 *
 * Albums come from a Google Sheet via n8n, so every field is a string:
 * has_review is "TRUE"/"FALSE" and dates are "DD-MM-YYYY".
 */

export const LIKED_ALBUMS_URL = 'https://n8n.niprobin.com/webhook/liked-albums'
export const FALLBACK_COVER = 'https://music.niprobin.com/radio_cover.png'

const DISCOGS_HOME = 'https://www.discogs.com'

export function isReviewed(album) {
  return album?.has_review === 'TRUE' && Boolean(album.slug)
}

export function reviewPath(album) {
  return isReviewed(album) ? `/albums/${album.slug}` : null
}

// Prefer a Discogs release/master page, fall back to Spotify. A bare
// Discogs homepage URL is a placeholder in the sheet, not a real link.
export function externalLink(album) {
  if (!album) return ''
  const discogs = (album.discogs_url || '').trim()
  const spotify = (album.spotify_url || '').trim()

  if (discogs && (discogs.includes('/release') || discogs.includes('/master'))) {
    return discogs
  }
  if ((!discogs || discogs === DISCOGS_HOME) && spotify) {
    return spotify
  }
  return ''
}

// Parses "DD-MM-YYYY" into a local Date, or null if it isn't one.
export function parseSheetDate(value) {
  if (!value) return null
  const [day, month, year] = String(value).split('-').map(Number)
  if (!day || !month || !year) return null
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatSheetDate(value) {
  if (!value) return 'Date inconnue'
  const date = parseSheetDate(value)
  if (!date) return String(value)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Splits review text into paragraphs (blank-line separated), each a list of
// lines, so the template can render it as text without v-html.
export function reviewParagraphs(text) {
  if (!text) return []
  return String(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
}
