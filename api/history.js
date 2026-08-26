// Proxies the n8n history webhook so the URL never reaches the client bundle
// and so visitor traffic is decoupled from load on the n8n/VPS side.
//
// AzuraCast's nowplaying API is NOT used here: its Liquidsoap 2.4.5
// replay_metadata bug freezes song metadata on new-track inserts, making it
// an unreliable source. The n8n webhook reads history from a datatable that
// is kept in sync by polling Icecast's ICY metadata separately.

const FETCH_TIMEOUT_MS = 5000
const MAX_TRACKS = 10

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, tracks: [], error: 'Method not allowed' })
  }

  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30')

  const webhookUrl = process.env.N8N_HISTORY_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(200).json({ ok: false, tracks: [], error: 'History source not configured' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let data
    try {
      const response = await fetch(webhookUrl, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Upstream responded with ${response.status}`)
      }
      data = await response.json()
    } finally {
      clearTimeout(timeout)
    }

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response shape from n8n')
    }

    // Order is preserved as-is: n8n already sorts most-recent-first.
    const tracks = data
      .filter((entry) => entry && (entry.artist || entry.title))
      .slice(0, MAX_TRACKS)
      .map((entry) => ({
        artist: entry.artist || null,
        title: entry.title || null,
        fullDate: entry.full_date || null
      }))

    return res.status(200).json({ ok: true, tracks })
  } catch (err) {
    return res.status(200).json({ ok: false, tracks: [], error: 'History temporarily unavailable' })
  }
}
