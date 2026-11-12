import { describe, it, expect } from 'vitest'
import { externalLink, formatSheetDate, recentTopAlbums, albumNames, coverUrl, FALLBACK_COVER, isCoupDeCoeur, groupByMonth } from '../src/lib/albums.js'

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
    ({ album_name: name, rating, liked_date: liked, release_date: released })

  it('keeps albums rated 4+ by most recent liked date, limited to count', () => {
    const list = [
      album('old', '5', '01-01-2026', '01-01-2020'),
      album('low', '3', '10-10-2026', '01-01-2020'),
      album('a', '4', '05-10-2026', '01-01-2020'),
      album('b', '5', '09-10-2026', '01-01-2020'),
      album('c', '4', '07-10-2026', '01-01-2020'),
      album('d', '4', '06-10-2026', '01-01-2020')
    ]
    expect(recentTopAlbums(list, { count: 4 }).map(a => a.album_name))
      .toEqual(['b', 'c', 'd', 'a'])
  })

  it('breaks same-day ties by most recent release date', () => {
    const list = [
      album('older', '4', '28-10-2026', '01-01-1999'),
      album('newer', '4', '28-10-2026', '22-05-2026')
    ]
    expect(recentTopAlbums(list).map(a => a.album_name)).toEqual(['newer', 'older'])
  })

  it('skips albums without a liked date and tolerates bad input', () => {
    expect(recentTopAlbums([album('x', '5', '', '01-01-2020')])).toEqual([])
    expect(recentTopAlbums(null)).toEqual([])
  })
})

describe('isCoupDeCoeur', () => {
  it('is true for ratings of 4 and above', () => {
    expect(isCoupDeCoeur({ rating: '4' })).toBe(true)
    expect(isCoupDeCoeur({ rating: '5' })).toBe(true)
    expect(isCoupDeCoeur({ rating: '3' })).toBe(false)
    expect(isCoupDeCoeur({ rating: 'null' })).toBe(false)
    expect(isCoupDeCoeur(null)).toBe(false)
  })
})

describe('groupByMonth', () => {
  const list = [
    { album_name: 'a', liked_date: '03-10-2026', rating: '3' },
    { album_name: 'b', liked_date: '28-11-2026', rating: '4' },
    { album_name: 'c', liked_date: '15-10-2026', rating: '5' },
    { album_name: 'd', liked_date: 'null', rating: '5' },
    { album_name: 'e', liked_date: '01-11-2025', rating: '2' }
  ]

  it('groups by liked month, newest first, undated last', () => {
    const groups = groupByMonth(list)
    expect(groups.map(g => g.key)).toEqual(['2026-11', '2026-10', '2025-11', 'none'])
    expect(groups[0].label).toBe('novembre 2026')
    expect(groups[3].label).toBe('Sans date')
  })

  it('orders albums by rating inside a month', () => {
    const october = groupByMonth(list).find(g => g.key === '2026-10')
    expect(october.items.map(a => a.album_name)).toEqual(['c', 'a'])
  })

  it('returns an empty array for bad input', () => {
    expect(groupByMonth(null)).toEqual([])
  })
})

describe('albumNames', () => {
  it('reads artist_name and album_name', () => {
    expect(albumNames({ artist_name: 'Joe Armon-Jones', album_name: 'Turn to Clear View' }))
      .toEqual({ artist: 'Joe Armon-Jones', title: 'Turn to Clear View' })
  })

  it('treats missing and "null" cells as empty', () => {
    expect(albumNames({ artist_name: 'null', album_name: ' ' })).toEqual({ artist: '', title: '' })
    expect(albumNames(null)).toEqual({ artist: '', title: '' })
  })
})

describe('coverUrl', () => {
  it('returns the cover, or the placeholder when empty or "null"', () => {
    expect(coverUrl({ cover_url: ' https://x/c.jpg ' })).toBe('https://x/c.jpg')
    expect(coverUrl({ cover_url: 'null' })).toBe(FALLBACK_COVER)
    expect(coverUrl({ cover_url: '' })).toBe(FALLBACK_COVER)
    expect(coverUrl(null)).toBe(FALLBACK_COVER)
  })
})
