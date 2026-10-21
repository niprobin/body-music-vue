export const STATION_NAME = 'Body Music Radio'

// The text shown in the header player for a given player state.
export function playerLabel({ isError, isLoading, isPlaying, artist, title }) {
  if (isError) return 'Erreur, réessayez'
  if (isLoading) return 'Connexion au stream...'
  if (!isPlaying) return 'Lancer la radio'
  if (title && artist) return `${title}  •  ${artist}`
  if (title) return title
  return STATION_NAME
}
