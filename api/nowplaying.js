// Proxies Icecast's status-json.xsl directly, bypassing AzuraCast's
// nowplaying API entirely (see api/history.js for why that API is unreliable).

const ICECAST_STATUS_URL = 'https://azuracast.niprobin.com/listen/body_music_radio/status-json.xsl'
const MOUNT_SUFFIX = 'public.mp3'
const FETCH_TIMEOUT_MS = 5000

function parseStreamTitle(raw) {
  if (!raw) return { artist: null, title: null }

  const separatorIndex = raw.indexOf(' - ')
  if (separatorIndex === -1) {
    return { artist: null, title: raw.trim() || null }
  }

  const artist = raw.slice(0, separatorIndex).trim() || null
  const title = raw.slice(separatorIndex + 3).trim() || null
  return { artist, title }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let data
    try {
      const response = await fetch(ICECAST_STATUS_URL, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Upstream responded with ${response.status}`)
      }
      data = await response.json()
    } finally {
      clearTimeout(timeout)
    }

    // icestats.source is an object with one mount point, but becomes an
    // array as soon as a second mount (e.g. an AAC stream) is added.
    let source = data?.icestats?.source
    if (Array.isArray(source)) {
      source = source.find((s) => s.listenurl?.endsWith(MOUNT_SUFFIX)) || source[0]
    }

    const raw = source?.title || ''
    const { artist, title } = parseStreamTitle(raw)

    return res.status(200).json({
      ok: true,
      artist,
      title,
      display: raw || null,
      updatedAt: Date.now()
    })
  } catch (err) {
    return res.status(200).json({
      ok: false,
      artist: null,
      title: null,
      display: null,
      updatedAt: Date.now(),
      error: 'Now playing temporarily unavailable'
    })
  }
}
