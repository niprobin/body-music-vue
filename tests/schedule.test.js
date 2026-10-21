import { describe, it, expect } from 'vitest'
import { parisNow, toMinutes, currentSlot } from '../src/lib/schedule.js'

// January dates, so Paris is UTC+1. 2026-01-05 is a Monday.
const schedule = {
  lundi: [
    { start: '06:30', end: '10:00', show: 'Bonjour tout le monde' },
    { start: '10:00', end: '21:00', show: 'On groove ensemble' },
    { start: '22:00', end: '23:59', show: 'Bonne nuit les enfants' }
  ]
}

const at = (iso) => new Date(iso)

describe('toMinutes', () => {
  it('converts HH:MM and treats 23:59 as midnight', () => {
    expect(toMinutes('06:30')).toBe(390)
    expect(toMinutes('23:59')).toBe(1440)
  })
})

describe('parisNow', () => {
  it('uses the Paris day when it differs from the UTC day', () => {
    // Sunday 23:30 UTC is Monday 00:30 in Paris
    expect(parisNow(at('2026-01-04T23:30:00Z'))).toEqual({ day: 'lundi', minutes: 30 })
  })
})

describe('currentSlot', () => {
  it('finds the show in the middle of its slot', () => {
    expect(currentSlot(schedule, at('2026-01-05T11:00:00Z')))
      .toEqual({ day: 'lundi', show: schedule.lundi[1] })
  })

  it('switches shows exactly at the start boundary', () => {
    expect(currentSlot(schedule, at('2026-01-05T09:00:00Z')).show.show).toBe('On groove ensemble')
  })

  it('keeps the last show highlighted at 23:59:30 Paris time', () => {
    expect(currentSlot(schedule, at('2026-01-05T22:59:30Z')).show.show).toBe('Bonne nuit les enfants')
  })

  it('returns null when nothing is scheduled', () => {
    expect(currentSlot(schedule, at('2026-01-05T02:00:00Z'))).toBeNull() // 03:00 Paris
    expect(currentSlot(schedule, at('2026-01-05T20:30:00Z'))).toBeNull() // 21:30 gap
    expect(currentSlot({}, at('2026-01-05T11:00:00Z'))).toBeNull()
  })
})
