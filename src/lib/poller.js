// Runs a task immediately and then every intervalMs, until stopped.
export function createPoller(task, intervalMs) {
  let intervalId = null

  return {
    start() {
      if (intervalId) return
      task()
      intervalId = setInterval(task, intervalMs)
    },
    stop() {
      if (!intervalId) return
      clearInterval(intervalId)
      intervalId = null
    }
  }
}
