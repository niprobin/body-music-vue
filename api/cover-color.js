// Computes an album cover's dominant colour, for n8n to store in
// Supabase `albums.cover_color` (the album sheet's background).
// GET /api/cover-color?url=<cover url> → { ok: true, hex: "#8db0d5" }
//
// Same algorithm as the browser fallback (src/lib/coverColor.js) on a
// 64×64 copy of the cover. Only known cover hosts are fetched, so this
// can't be used as an open proxy.

import sharp from 'sharp'
import { dominantColor, toHex } from '../src/lib/coverColor.js'

export const ALLOWED_HOSTS = [
  'cdn-images.dzcdn.net',
  'e-cdns-images.dzcdn.net',
  'res.cloudinary.com',
  'resources.tidal.com'
]

const FETCH_TIMEOUT_MS = 15000
const MAX_BYTES = 15 * 1024 * 1024
const SIZE = 64

export function isAllowedCoverUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ALLOWED_HOSTS.includes(url.hostname)
  } catch (_) {
    return false
  }
}

async function fetchImage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Cover responded with ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length > MAX_BYTES) throw new Error('Cover too large')
    return buffer
  } finally {
    clearTimeout(timeout)
  }
}

export async function coverColorFromBuffer(buffer) {
  const pixels = await sharp(buffer)
    .resize(SIZE, SIZE, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer()
  const color = dominantColor(pixels)
  return color ? toHex(color) : null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const url = req.query?.url
  if (!isAllowedCoverUrl(url)) {
    return res.status(400).json({ ok: false, error: 'url must be an https cover from an allowed host' })
  }

  try {
    const hex = await coverColorFromBuffer(await fetchImage(url))
    if (!hex) throw new Error('No usable pixels')
    // A cover URL never changes content: cache the answer at the edge.
    res.setHeader('Cache-Control', 's-maxage=31536000, immutable')
    return res.status(200).json({ ok: true, hex })
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message })
  }
}
