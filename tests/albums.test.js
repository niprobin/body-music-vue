import { describe, it, expect } from 'vitest'
import { externalLink, formatSheetDate } from '../src/lib/albums.js'

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
