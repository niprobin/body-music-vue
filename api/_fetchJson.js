// Shared by the API handlers. The leading underscore keeps Vercel from
// deploying this file as its own function.

const FETCH_TIMEOUT_MS = 5000

export async function fetchJson(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Upstream responded with ${response.status}`)
    }
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}
