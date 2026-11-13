import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchLikedAlbums } from '../src/lib/albums.js'

function respond(body, { ok = true, status = 200 } = {}) {
  return vi.fn().mockResolvedValue({ ok, status, json: async () => body })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('fetchLikedAlbums', () => {
  it('returns the list', async () => {
    const list = [{ deezer_id: '1', album_name: 'A' }]
    vi.stubGlobal('fetch', respond(list))
    await expect(fetchLikedAlbums()).resolves.toEqual(list)
  })

  it('rejects an n8n error object instead of turning it into an album', async () => {
    vi.stubGlobal('fetch', respond({ message: 'Error in workflow' }))
    await expect(fetchLikedAlbums()).rejects.toThrow('did not return a list')
  })

  it('rejects HTTP errors', async () => {
    vi.stubGlobal('fetch', respond({ message: 'Error in workflow' }, { ok: false, status: 500 }))
    await expect(fetchLikedAlbums()).rejects.toThrow('responded 500')
  })

  it('gives up after the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    })))
    const pending = fetchLikedAlbums({ timeout: 1000 })
    const assertion = expect(pending).rejects.toThrow('timed out after 1000 ms')
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})
