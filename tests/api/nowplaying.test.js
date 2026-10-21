import { describe, it, expect, vi, afterEach } from 'vitest'
import handler from '../../api/nowplaying.js'
import { fakeRes, stubFetchJson } from './fakeHttp.js'

const get = { method: 'GET' }

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('GET /api/nowplaying', () => {
  it('returns artist and title from a single Icecast source', async () => {
    stubFetchJson({ icestats: { source: {
      artist: ' Hermanos Gutierrez ', title: 'Venganza', yp_currently_playing: 'Hermanos Gutierrez - Venganza'
    } } })
    const res = fakeRes()
    await handler(get, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      ok: true, artist: 'Hermanos Gutierrez', title: 'Venganza', display: 'Hermanos Gutierrez - Venganza'
    })
  })

  it('picks the public.mp3 mount when Icecast lists several sources', async () => {
    stubFetchJson({ icestats: { source: [
      { listenurl: 'https://x/listen/aac', artist: 'Wrong', title: 'Mount' },
      { listenurl: 'https://x/listen/public.mp3', artist: 'Right', title: 'Mount' }
    ] } })
    const res = fakeRes()
    await handler(get, res)
    expect(res.body.artist).toBe('Right')
  })

  it('parses yp_currently_playing when artist and title are missing', async () => {
    stubFetchJson({ icestats: { source: { yp_currently_playing: 'Khruangbin - Maria También' } } })
    const res = fakeRes()
    await handler(get, res)
    expect(res.body).toMatchObject({ ok: true, artist: 'Khruangbin', title: 'Maria También' })
  })

  it('reports ok:false when Icecast errors', async () => {
    stubFetchJson({}, 500)
    const res = fakeRes()
    await handler(get, res)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ ok: false, artist: null, title: null })
  })

  it('reports ok:false when Icecast times out', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_, { signal }) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(new Error('aborted')))
    })))
    const res = fakeRes()
    const pending = handler(get, res)
    await vi.advanceTimersByTimeAsync(5000)
    await pending
    expect(res.body.ok).toBe(false)
  })

  it('rejects other methods', async () => {
    const res = fakeRes()
    await handler({ method: 'POST' }, res)
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('GET')
  })
})
