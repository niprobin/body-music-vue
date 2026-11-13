import { describe, it, expect, vi, afterEach } from 'vitest'
import sharp from 'sharp'
import handler, { isAllowedCoverUrl, coverFetchUrl, coverColorFromBuffer } from '../../api/cover-color.js'
import { fakeRes } from './fakeHttp.js'

const COVER = 'https://cdn-images.dzcdn.net/images/cover/abc/1000x1000-000000-80-0-0.jpg'

// A 100×100 PNG: 70% blue background, 30% black band.
async function coverPng() {
  const band = await sharp({ create: { width: 100, height: 30, channels: 3, background: '#000000' } }).png().toBuffer()
  return sharp({ create: { width: 100, height: 100, channels: 3, background: '#3c6ec8' } })
    .composite([{ input: band, top: 70, left: 0 }])
    .png()
    .toBuffer()
}

function stubImage(buffer, status = 200) {
  const fetch = vi.fn(async () => ({
    ok: status < 400,
    status,
    arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => vi.unstubAllGlobals())

describe('isAllowedCoverUrl', () => {
  it('accepts https covers from known hosts only', () => {
    expect(isAllowedCoverUrl(COVER)).toBe(true)
    expect(isAllowedCoverUrl('https://res.cloudinary.com/x/image/upload/a.webp')).toBe(true)
    expect(isAllowedCoverUrl('ftp://cdn-images.dzcdn.net/a.jpg')).toBe(false)
    expect(isAllowedCoverUrl('https://evil.example/a.jpg')).toBe(false)
    expect(isAllowedCoverUrl('https://cdn-images.dzcdn.net.evil.example/a.jpg')).toBe(false)
    expect(isAllowedCoverUrl('null')).toBe(false)
    expect(isAllowedCoverUrl(undefined)).toBe(false)
  })
})

describe('coverFetchUrl', () => {
  it('upgrades http covers to https', () => {
    expect(coverFetchUrl('http://res.cloudinary.com/x/image/upload/a.webp'))
      .toBe('https://res.cloudinary.com/x/image/upload/a.webp')
    expect(coverFetchUrl(COVER)).toBe(COVER)
    expect(coverFetchUrl('http://evil.example/a.jpg')).toBeNull()
  })
})

describe('coverColorFromBuffer', () => {
  it('returns the dominant colour as hex', async () => {
    expect(await coverColorFromBuffer(await coverPng())).toBe('#3c6ec8')
  })
})

describe('GET /api/cover-color', () => {
  it('returns the hex and caches it', async () => {
    const fetch = stubImage(await coverPng())
    const res = fakeRes()
    await handler({ method: 'GET', query: { url: COVER } }, res)
    expect(fetch).toHaveBeenCalledWith(COVER, expect.anything())
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true, hex: '#3c6ec8' })
    expect(res.headers['Cache-Control']).toContain('s-maxage')
  })

  it('fetches http covers over https', async () => {
    const fetch = stubImage(await coverPng())
    const res = fakeRes()
    await handler({ method: 'GET', query: { url: 'http://res.cloudinary.com/x/image/upload/a.webp' } }, res)
    expect(fetch).toHaveBeenCalledWith('https://res.cloudinary.com/x/image/upload/a.webp', expect.anything())
    expect(res.body).toEqual({ ok: true, hex: '#3c6ec8' })
  })

  it('refuses other hosts without fetching', async () => {
    const fetch = stubImage(Buffer.alloc(0))
    const res = fakeRes()
    await handler({ method: 'GET', query: { url: 'https://evil.example/a.jpg' } }, res)
    expect(res.statusCode).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reports upstream failures', async () => {
    stubImage(Buffer.alloc(0), 404)
    const res = fakeRes()
    await handler({ method: 'GET', query: { url: COVER } }, res)
    expect(res.statusCode).toBe(502)
    expect(res.body.ok).toBe(false)
  })

  it('only allows GET', async () => {
    const res = fakeRes()
    await handler({ method: 'POST', query: {} }, res)
    expect(res.statusCode).toBe(405)
  })
})
