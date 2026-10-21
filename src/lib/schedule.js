/**
 * Schedule rules. The station runs on Paris time, so "now" is always
 * computed in Europe/Paris rather than the visitor's own time zone.
 */

const TIME_ZONE = 'Europe/Paris'
const MINUTES_PER_DAY = 24 * 60

const parisClock = new Intl.DateTimeFormat('fr-FR', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
})

// Returns the French weekday name ("lundi"…) and minutes since midnight in Paris.
export function parisNow(date = new Date()) {
  const parts = Object.fromEntries(
    parisClock.formatToParts(date).map(({ type, value }) => [type, value])
  )
  return {
    day: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  }
}

// "HH:MM" to minutes since midnight. "23:59" is how the schedule writes
// midnight, so it counts as the end of the day.
export function toMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number)
  const total = hours * 60 + minutes
  return total === MINUTES_PER_DAY - 1 ? MINUTES_PER_DAY : total
}

export function currentSlot(schedule, date = new Date()) {
  const { day, minutes } = parisNow(date)
  const shows = schedule?.[day] || []
  const show = shows.find((s) => minutes >= toMinutes(s.start) && minutes < toMinutes(s.end))
  return show ? { day, show } : null
}
