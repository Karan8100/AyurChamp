export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ApiError = { detail?: string; message?: string }

// ── In-Memory Client Cache Engine ─────────────────────────
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function getCached<T>(path: string, maxAgeMs = DEFAULT_CACHE_TTL_MS): T | null {
  const entry = memoryCache.get(path) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() - entry.timestamp > maxAgeMs) {
    memoryCache.delete(path)
    return null
  }
  return entry.data
}

export function setCached<T>(path: string, data: T): void {
  memoryCache.set(path, { data, timestamp: Date.now() })
}

export function clearApiCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear()
    return
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Fetch helper that attaches the stored auth token (if any) and normalizes
 * error handling. Throws an Error with the backend's `detail`/`message`
 * when the response isn't ok.
 */
export async function authFetch<T>(path: string, init?: RequestInit, retries = 1): Promise<T> {
  const token = localStorage.getItem('ayushya_token') || localStorage.getItem('ayusha_token')
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      })

      if (response.status === 401) {
        clearApiCache()
        localStorage.removeItem('ayushya_token')
        localStorage.removeItem('ayusha_token')
        localStorage.removeItem('ayushya_assessment_status')
        localStorage.removeItem('ayusha_assessment_status')
        localStorage.removeItem('ayushya_assessment_result')
        localStorage.removeItem('ayusha_assessment_result')
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login'
        }
      }

      if (!response.ok) {
        let message = 'Something went wrong. Please try again.'
        try {
          const data = (await response.json()) as ApiError
          message = data.detail ?? data.message ?? message
        } catch {
          // response had no JSON body — keep the default message
        }
        const err = new Error(message) as Error & { status?: number }
        err.status = response.status
        throw err
      }

      return response.json() as Promise<T>
    } catch (err: any) {
      lastError = err
      if (attempt < retries && (err?.name === 'TypeError' || err?.message?.includes('fetch'))) {
        await new Promise((resolve) => setTimeout(resolve, 350))
        continue
      }
      throw err
    }
  }

  throw lastError
}

/**
 * Cached auth fetch: returns fresh data if cache is missing or stale,
 * or immediately resolves with cached data when available.
 */
export async function cachedAuthFetch<T>(
  path: string,
  options?: {
    ttlMs?: number
    forceRefresh?: boolean
    init?: RequestInit
  }
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_CACHE_TTL_MS
  if (!options?.forceRefresh) {
    const cached = getCached<T>(path, ttlMs)
    if (cached !== null) {
      return cached
    }
  }

  const fresh = await authFetch<T>(path, options?.init)
  setCached<T>(path, fresh)
  return fresh
}

