/**
 * Colour rules for the album sheet: the cover's dominant colour as the
 * background, and black or white text, whichever contrasts best.
 */

export const STAR_YELLOW = [250, 204, 21] // #facc15

// RGBA pixel data (from canvas getImageData) → dominant [r, g, b].
// Pixels are bucketed by their top 3 bits per channel (so gradients of
// one hue land together); bright, saturated pixels weigh up to 4× more
// than greys, so a coloured background beats black clothes or a white
// frame unless those really fill the cover. The heaviest bucket's pixels
// are averaged. Returns null if nothing usable.
const SATURATION_WEIGHT = 3

export function dominantColor(data) {
  const buckets = new Map()
  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] < 128) continue // mostly transparent
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    const weight = 1 + SATURATION_WEIGHT * saturation * (max / 255)
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
    let bucket = buckets.get(key)
    if (!bucket) buckets.set(key, (bucket = { n: 0, weight: 0, r: 0, g: 0, b: 0 }))
    bucket.n++
    bucket.weight += weight
    bucket.r += r
    bucket.g += g
    bucket.b += b
  }

  let best = null
  for (const bucket of buckets.values()) {
    if (!best || bucket.weight > best.weight) best = bucket
  }
  if (!best) return null
  return [best.r, best.g, best.b].map(v => Math.round(v / best.n))
}

// WCAG 2.x relative luminance of an [r, g, b] colour (0–255 channels).
export function relativeLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Black or white, whichever reads better on `bg`.
export function textColorFor(bg) {
  const black = [0, 0, 0]
  const white = [255, 255, 255]
  return contrastRatio(bg, black) >= contrastRatio(bg, white) ? black : white
}

export function toCss([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`
}

// CSS custom properties for the sheet, from the cover's dominant colour.
// The yellow star stays yellow only if it still shows (3:1, WCAG icons).
export function sheetPalette(bg) {
  const fg = textColorFor(bg)
  const star = contrastRatio(STAR_YELLOW, bg) >= 3 ? STAR_YELLOW : fg
  return {
    '--sheet-bg': toCss(bg),
    '--sheet-fg': toCss(fg),
    '--sheet-fg-rgb': fg.join(', '),
    '--sheet-star': toCss(star)
  }
}

const cache = new Map()

// Browser only: loads the cover through CORS, shrinks it to 64×64 and
// returns its dominant [r, g, b], or null if it can't be read (no CORS,
// network error). Results are cached per URL.
export function readCoverColor(url) {
  if (!url) return Promise.resolve(null)
  if (cache.has(url)) return cache.get(url)

  const promise = new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      try {
        const size = 64
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0, size, size)
        resolve(dominantColor(ctx.getImageData(0, 0, size, size).data))
      } catch (_) {
        resolve(null) // tainted canvas
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
  cache.set(url, promise)
  return promise
}

export function toHex([r, g, b]) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

// "#8db0d5" (or "8db0d5") → [141, 176, 213]; null if it isn't a hex colour.
export function parseHex(value) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(value || '').trim())
  if (!match) return null
  const n = parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
