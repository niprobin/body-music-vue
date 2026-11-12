import { describe, it, expect } from 'vitest'
import { externalLink, formatSheetDate, recentTopAlbums, splitReleaseName, albumNames, isCoupDeCoeur, groupByMonth } from '../src/lib/albums.js'

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

describe('splitReleaseName', () => {
  it('splits "Artist  - Title" on the first separator', () => {
    expect(splitReleaseName('Herbert  - Bodily Functions'))
      .toEqual({ artist: 'Herbert', title: 'Bodily Functions' })
    expect(splitReleaseName('Gitkin - Where the South Winds Wail'))
      .toEqual({ artist: 'Gitkin', title: 'Where the South Winds Wail' })
  })

  it('keeps later dashes in the title', () => {
    expect(splitReleaseName('Moodymann  - Live - Paris'))
      .toEqual({ artist: 'Moodymann', title: 'Live - Paris' })
  })

  it('drops the artist tail that upstream repeats for hyphenated artists', () => {
    expect(splitReleaseName('Joe Armon-Jones  - ones - All The Quiet (Part II)'))
      .toEqual({ artist: 'Joe Armon-Jones', title: 'All The Quiet (Part II)' })
    expect(splitReleaseName('Allah-Las  - as - Worship the Sun'))
      .toEqual({ artist: 'Allah-Las', title: 'Worship the Sun' })
  })

  it('handles missing names and names without an artist', () => {
    expect(splitReleaseName('null')).toEqual({ artist: '', title: '' })
    expect(splitReleaseName(undefined)).toEqual({ artist: '', title: '' })
    expect(splitReleaseName('Untitled')).toEqual({ artist: '', title: 'Untitled' })
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
    { release_name: 'a', liked_date: '03-10-2026', rating: '3' },
    { release_name: 'b', liked_date: '28-11-2026', rating: '4' },
    { release_name: 'c', liked_date: '15-10-2026', rating: '5' },
    { release_name: 'd', liked_date: 'null', rating: '5' },
    { release_name: 'e', liked_date: '01-11-2025', rating: '2' }
  ]

  it('groups by liked month, newest first, undated last', () => {
    const groups = groupByMonth(list)
    expect(groups.map(g => g.key)).toEqual(['2026-11', '2026-10', '2025-11', 'none'])
    expect(groups[0].label).toBe('novembre 2026')
    expect(groups[3].label).toBe('Sans date')
  })

  it('orders albums by rating inside a month', () => {
    const october = groupByMonth(list).find(g => g.key === '2026-10')
    expect(october.items.map(a => a.release_name)).toEqual(['c', 'a'])
  })

  it('returns an empty array for bad input', () => {
    expect(groupByMonth(null)).toEqual([])
  })
})

describe('albumNames', () => {
  it('uses the Supabase artist_name and album_name when present', () => {
    expect(albumNames({ artist_name: 'Joe Armon-Jones', album_name: 'Turn to Clear View', release_name: 'x  - y' }))
      .toEqual({ artist: 'Joe Armon-Jones', title: 'Turn to Clear View' })
  })

  it('falls back to release_name when the fields are missing or "null"', () => {
    expect(albumNames({ artist_name: 'null', album_name: 'null', release_name: 'Herbert  - Bodily Functions' }))
      .toEqual({ artist: 'Herbert', title: 'Bodily Functions' })
  })
})
