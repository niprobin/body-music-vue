/**
 * Privacy-friendly analytics composable
 * Sends page views to n8n webhook with basic bot detection
 */

const ANALYTICS_ENDPOINT = 'https://n8n.niprobin.com/webhook/analytics'

// Simple bot detection - check if user agent contains common bot keywords
function isBot(userAgent) {
  const botKeywords = ['bot', 'crawler', 'spider', 'scraper', 'headless']
  return botKeywords.some(keyword =>
    userAgent.toLowerCase().includes(keyword)
  )
}

// Ignore a repeat of the same path within this window (duplicate
// navigations); distinct page views are always sent.
let lastTrackedPath = null
let lastTrackTime = 0
const DUPLICATE_WINDOW_MS = 2000

export function useAnalytics() {

  const trackPageView = async (pagePath) => {
    try {
      const now = Date.now()
      if (pagePath === lastTrackedPath && now - lastTrackTime < DUPLICATE_WINDOW_MS) {
        return
      }
      lastTrackedPath = pagePath
      lastTrackTime = now

      // Skip if user agent indicates bot
      const userAgent = navigator.userAgent || ''
      if (isBot(userAgent)) {
        return
      }

      // Prepare payload - convert root path to readable name
      const displayPath = pagePath === '/' ? '/home' : pagePath

      const payload = {
        page: displayPath,
        timestamp: new Date().toISOString(),
        userAgent: userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset()
      }

      // Send to n8n webhook (non-blocking)
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Don't wait for response - fire and forget
        keepalive: true
      }).catch(() => {
        // Silent fail - analytics should never break the app
        // Could add console.debug for development if needed
      })

    } catch (error) {
      // Silent fail - analytics errors should not affect user experience
      // Could add console.debug for development if needed
    }
  }

  return {
    trackPageView
  }
}