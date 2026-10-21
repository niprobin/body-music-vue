import { describe, it, expect } from 'vitest'
import { playerLabel } from '../src/lib/playerLabel.js'

const playing = { isError: false, isLoading: false, isPlaying: true }

describe('playerLabel', () => {
  it('shows the error label first', () => {
    expect(playerLabel({ ...playing, isError: true, isLoading: true, title: 'T' })).toBe('Erreur, réessayez')
  })

  it('shows the connecting label while loading', () => {
    expect(playerLabel({ ...playing, isLoading: true, title: 'T' })).toBe('Connexion au stream...')
  })

  it('invites to play when stopped', () => {
    expect(playerLabel({ ...playing, isPlaying: false, title: 'T', artist: 'A' })).toBe('Lancer la radio')
  })

  it('shows title and artist when both are known', () => {
    expect(playerLabel({ ...playing, title: 'Venganza', artist: 'Hermanos Gutierrez' }))
      .toBe('Venganza  •  Hermanos Gutierrez')
  })

  it('shows the title alone when the artist is unknown', () => {
    expect(playerLabel({ ...playing, title: 'Venganza', artist: null })).toBe('Venganza')
  })

  it('falls back to the station name', () => {
    expect(playerLabel({ ...playing, artist: 'Only artist' })).toBe('Body Music Radio')
    expect(playerLabel(playing)).toBe('Body Music Radio')
  })
})
