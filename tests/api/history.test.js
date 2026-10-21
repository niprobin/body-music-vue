import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import handler from '../../api/history.js'
import { fakeRes, stubFetchJson } from './fakeHttp.js'

const get = { method: 'GET' }

beforeEach(() => {
  vi.stubEnv('N8N_HISTORY_WEBHOOK_URL', 'https://n8n.example/webhook/history')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('GET /api/history', () => {
  it('maps n8n entries to tracks, skipping empty ones', async () => {
    stubFetchJson([
      { artist: 'A', title: 'One', full_date: '21/10 10:00' },
      { artist: '', title: '' },
      { title: 'Two' }
    ])
    const res = fakeRes()
    await handler(get, res)
    expect(res.body).toEqual({
      ok: true,
      tracks: [
        { artist: 'A', title: 'One', fullDate: '21/10 10:00' },
        { artist: null, title: 'Two', fullDate: null }
      ]
    })
  })

  it('returns at most 10 tracks', async () => {
    stubFetchJson(Array.from({ length: 15 }, (_, i) => ({ artist: 'A', title: `T${i}` })))
    const res = fakeRes()
    await handler(get, res)
    expect(res.body.tracks).toHaveLength(10)
    expect(res.body.tracks[0].title).toBe('T0')
  })

  it('reports ok:false for a non-array response', async () => {
    stubFetchJson({ unexpected: true })
    const res = fakeRes()
    await handler(get, res)
    expect(res.body).toMatchObject({ ok: false, tracks: [] })
  })

  it('reports ok:false when the webhook is not configured', async () => {
    vi.stubEnv('N8N_HISTORY_WEBHOOK_URL', '')
    const fetch = stubFetchJson([])
    const res = fakeRes()
    await handler(get, res)
    expect(res.body).toMatchObject({ ok: false, error: 'History source not configured' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects other methods', async () => {
    const res = fakeRes()
    await handler({ method: 'DELETE' }, res)
    expect(res.statusCode).toBe(405)
  })
})
