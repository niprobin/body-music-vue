import { vi } from 'vitest'

export function fakeRes() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this }
  }
}

export function stubFetchJson(body, status = 200) {
  const fetch = vi.fn(async () => ({ ok: status < 400, status, json: async () => body }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}
