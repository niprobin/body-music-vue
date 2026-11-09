/**
 * Album rules shared by Home and Albums.
 *
 * Albums come from a Google Sheet via n8n, so every field is a string;
 * dates are "DD-MM-YYYY".
 */

export const LIKED_ALBUMS_URL = 'https://n8n.niprobin.com/webhook/liked-albums'
export const FALLBACK_COVER = 'https://music.niprobin.com/radio_cover.png'

const DISCOGS_HOME = 'https://www.discogs.com'

// Empty sheet cells come through as the string "null".
function cleanUrl(value) {
  const url = String(value || '').trim()
  return url === 'null' ? '' : url
}

// Prefer a Discogs release/master page, fall back to Spotify. A bare
// Discogs homepage URL is a placeholder in the sheet, not a real link.
export function externalLink(album) {
  if (!album) return ''
  const discogs = cleanUrl(album.discogs_url)
  const spotify = cleanUrl(album.spotify_url)

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

// The most recently liked albums rated at least `minRating`, newest first.
// Albums liked the same day are ordered by release date, newest first.
export function recentTopAlbums(list, { count = 4, minRating = 4 } = {}) {
  const time = (value) => parseSheetDate(value)?.getTime() ?? -Infinity
  return (Array.isArray(list) ? list : [])
    .filter(album => Number(album.rating) >= minRating && parseSheetDate(album.liked_date))
    .sort((a, b) =>
      time(b.liked_date) - time(a.liked_date) ||
      time(b.release_date) - time(a.release_date))
    .slice(0, count)
}

const CACHE_KEY = 'albums_cache'
const CACHE_TIME_KEY = 'albums_cache_time'
const CACHE_TTL = 24 * 60 * 60 * 1000

// Storage can be blocked (private mode) or hold corrupt JSON; either way
// treat it as "no cache" so the network fetch still runs.
export function readCachedAlbums() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY))
    const isFresh = Array.isArray(cached) && Date.now() - cachedTime < CACHE_TTL
    return isFresh ? cached : null
  } catch (_) {
    return null
  }
}

function writeCachedAlbums(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
  } catch (_) {
    // Storage full or blocked: the pages work without a cache.
  }
}

// Fetches the liked albums and refreshes the shared cache. Throws on failure.
export async function fetchLikedAlbums() {
  const res = await fetch(LIKED_ALBUMS_URL)
  if (!res.ok) throw new Error(`liked-albums responded ${res.status}`)
  const data = await res.json()
  const list = Array.isArray(data) ? data : data ? [data] : []
  writeCachedAlbums(list)
  return list
}
