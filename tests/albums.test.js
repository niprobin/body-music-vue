import { describe, it, expect } from 'vitest'
import { externalLink, formatSheetDate, recentTopAlbums } from '../src/lib/albums.js'

describe('externalLink', () => {
  it('prefers a Discogs release or master page', () => {
    expect(externalLink({
      discogs_url: 'https://www.discogs.com/release/123',
      spotify_url: 'https://open.spotify.com/album/x'
    })).toBe('https://www.discogs.com/release/123')
    expect(externalLink({ discogs_url: ' https://www.discogs.com/master/9 ' }))
      .toBe('https://www.discogs.com/master/9')
  })

  it('falls back to Spotify when Discogs is the bare homepage or missing', () => {
    const spotify = 'https://open.spotify.com/album/x'
    expect(externalLink({ discogs_url: 'https://www.discogs.com', spotify_url: spotify })).toBe(spotify)
    expect(externalLink({ spotify_url: spotify })).toBe(spotify)
  })

  it('returns an empty string when there is nothing usable', () => {
    expect(externalLink({ discogs_url: 'https://www.discogs.com' })).toBe('')
    expect(externalLink({ discogs_url: 'https://www.discogs.com/artist/1', spotify_url: 'x' })).toBe('')
    expect(externalLink(null)).toBe('')
  })

  it('treats a "null" Discogs cell as empty', () => {
    const deezer = 'https://www.deezer.com/album/1'
    expect(externalLink({ discogs_url: 'null', spotify_url: deezer })).toBe(deezer)
  })
})

describe('formatSheetDate', () => {
  it('formats DD-MM-YYYY in French', () => {
    expect(formatSheetDate('05-03-2024')).toBe('5 mars 2024')
  })

  it('handles empty and malformed values', () => {
    expect(formatSheetDate('')).toBe('Date inconnue')
    expect(formatSheetDate(undefined)).toBe('Date inconnue')
    expect(formatSheetDate('bientôt')).toBe('bientôt')
  })
})

describe('recentTopAlbums', () => {
  const album = (name, rating, liked, released) =>
    ({ release_name: name, rating, liked_date: liked, release_date: released })

  it('keeps albums rated 4+ by most recent liked date, limited to count', () => {
    const list = [
      album('old', '5', '01-01-2026', '01-01-2020'),
      album('low', '3', '10-10-2026', '01-01-2020'),
      album('a', '4', '05-10-2026', '01-01-2020'),
      album('b', '5', '09-10-2026', '01-01-2020'),
      album('c', '4', '07-10-2026', '01-01-2020'),
      album('d', '4', '06-10-2026', '01-01-2020')
    ]
    expect(recentTopAlbums(list, { count: 4 }).map(a => a.release_name))
      .toEqual(['b', 'c', 'd', 'a'])
  })

  it('breaks same-day ties by most recent release date', () => {
    const list = [
      album('older', '4', '28-10-2026', '01-01-1999'),
      album('newer', '4', '28-10-2026', '22-05-2026')
    ]
    expect(recentTopAlbums(list).map(a => a.release_name)).toEqual(['newer', 'older'])
  })

  it('skips albums without a liked date and tolerates bad input', () => {
    expect(recentTopAlbums([album('x', '5', '', '01-01-2020')])).toEqual([])
    expect(recentTopAlbums(null)).toEqual([])
  })
})
