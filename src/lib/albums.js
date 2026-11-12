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

// Supabase `albums` has artist_name and album_name. Use them when the
// webhook sends them; otherwise fall back to parsing release_name.
export function albumNames(album) {
  const artist = cleanUrl(album?.artist_name)
  const title = cleanUrl(album?.album_name)
  if (artist || title) return { artist, title }
  return splitReleaseName(album?.release_name)
}

// Fallback for the legacy "Artist  - Title" release_name. Upstream mangles
// hyphenated artists into "Joe Armon-Jones  - ones - Title" (a tail of the
// artist name is repeated), so that tail is dropped.
export function splitReleaseName(value) {
  const name = String(value || '').trim()
  if (!name || name === 'null') return { artist: '', title: '' }
  const match = name.match(/^(.+?)\s+-\s+(.+)$/)
  if (!match) return { artist: '', title: name }

  const artist = match[1].trim()
  let title = match[2].trim()
  const echo = title.match(/^(\S+)\s+-\s+(.+)$/)
  if (echo && artist.includes('-') && artist.toLowerCase().endsWith(echo[1].toLowerCase())) {
    title = echo[2].trim()
  }
  return { artist, title }
}

// Rob's favourites: rated 4/5 or more.
export function isCoupDeCoeur(album) {
  return Number(album?.rating) >= 4
}

// Albums grouped by the month they were liked, newest month first.
// Inside a month, highest rating first. Undated albums go last.
export function groupByMonth(list) {
  const groups = new Map()
  for (const album of Array.isArray(list) ? list : []) {
    const date = parseSheetDate(album.liked_date)
    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : 'none'
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: date
          ? new Date(date.getFullYear(), date.getMonth(), 1)
            .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          : 'Sans date',
        ts: date ? new Date(date.getFullYear(), date.getMonth(), 1).getTime() : -Infinity,
        items: []
      })
    }
    groups.get(key).items.push(album)
  }

  return [...groups.values()]
    .sort((a, b) => b.ts - a.ts)
    .map(({ key, label, items }) => ({
      key,
      label,
      items: [...items].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    }))
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
