import { describe, it, expect } from 'vitest'
import {
  isReviewed,
  reviewPath,
  externalLink,
  formatSheetDate,
  reviewParagraphs
} from '../src/lib/albums.js'

describe('isReviewed / reviewPath', () => {
  it('treats only the string "TRUE" with a slug as reviewed', () => {
    const album = { has_review: 'TRUE', slug: 'kind-of-blue' }
    expect(isReviewed(album)).toBe(true)
    expect(reviewPath(album)).toBe('/albums/kind-of-blue')
  })

  it.each([
    ['"FALSE"', { has_review: 'FALSE', slug: 'kind-of-blue' }],
    ['missing has_review', { slug: 'kind-of-blue' }],
    ['"TRUE" without a slug', { has_review: 'TRUE', slug: '' }],
    ['no album', undefined]
  ])('is not reviewed for %s', (_, album) => {
    expect(isReviewed(album)).toBe(false)
    expect(reviewPath(album)).toBeNull()
  })
})

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

describe('reviewParagraphs', () => {
  it('splits on blank lines and keeps single line breaks within a paragraph', () => {
    expect(reviewParagraphs('Un\ndeux\n\nTrois\n\n\n')).toEqual([['Un', 'deux'], ['Trois']])
  })

  it('keeps markup as plain text', () => {
    expect(reviewParagraphs('<img src=x onerror=alert(1)> & co')).toEqual([
      ['<img src=x onerror=alert(1)> & co']
    ])
  })

  it('returns nothing for empty text', () => {
    expect(reviewParagraphs(undefined)).toEqual([])
  })
})
