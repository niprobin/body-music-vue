import { describe, it, expect } from 'vitest'
import { dominantColor, contrastRatio, textColorFor, sheetPalette, toHex, parseHex } from '../src/lib/coverColor.js'

// Builds RGBA data from [count, [r, g, b, a?]] runs.
function pixels(...runs) {
  const out = []
  for (const [count, [r, g, b, a = 255]] of runs) {
    for (let i = 0; i < count; i++) out.push(r, g, b, a)
  }
  return Uint8ClampedArray.from(out)
}

describe('dominantColor', () => {
  it('returns the most common colour, averaged within its bucket', () => {
    const data = pixels([10, [200, 30, 30]], [6, [202, 31, 30]], [5, [10, 10, 200]])
    expect(dominantColor(data)).toEqual([201, 30, 30])
  })

  it('lets a coloured area beat a slightly bigger dark one', () => {
    const data = pixels([30, [20, 20, 20]], [20, [60, 110, 200]])
    expect(dominantColor(data)).toEqual([60, 110, 200])
  })

  it('still picks black when it really fills the cover', () => {
    const data = pixels([80, [10, 10, 10]], [20, [60, 110, 200]])
    expect(dominantColor(data)).toEqual([10, 10, 10])
  })

  it('ignores transparent pixels', () => {
    const data = pixels([50, [255, 255, 255, 0]], [3, [0, 128, 0]])
    expect(dominantColor(data)).toEqual([0, 128, 0])
  })

  it('returns null when there is nothing to read', () => {
    expect(dominantColor(new Uint8ClampedArray())).toBeNull()
  })
})

describe('contrast', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5)
    expect(contrastRatio([10, 20, 30], [10, 20, 30])).toBe(1)
  })

  it('picks white text on dark covers and black on light ones', () => {
    expect(textColorFor([20, 20, 60])).toEqual([255, 255, 255])
    expect(textColorFor([220, 220, 220])).toEqual([0, 0, 0])
    expect(textColorFor([250, 204, 21])).toEqual([0, 0, 0])
  })
})

describe('sheetPalette', () => {
  it('keeps the yellow star on dark backgrounds', () => {
    expect(sheetPalette([20, 20, 40])).toMatchObject({
      '--sheet-bg': 'rgb(20, 20, 40)',
      '--sheet-fg': 'rgb(255, 255, 255)',
      '--sheet-fg-rgb': '255, 255, 255',
      '--sheet-star': 'rgb(250, 204, 21)'
    })
  })

  it('falls back to the text colour when yellow would not show', () => {
    expect(sheetPalette([240, 220, 120])['--sheet-star']).toBe('rgb(0, 0, 0)')
  })
})

describe('hex', () => {
  it('round-trips', () => {
    expect(toHex([141, 176, 213])).toBe('#8db0d5')
    expect(parseHex('#8DB0D5')).toEqual([141, 176, 213])
    expect(parseHex('8db0d5')).toEqual([141, 176, 213])
  })

  it('rejects anything else', () => {
    expect(parseHex('')).toBeNull()
    expect(parseHex('null')).toBeNull()
    expect(parseHex('#fff')).toBeNull()
    expect(parseHex(undefined)).toBeNull()
  })
})
