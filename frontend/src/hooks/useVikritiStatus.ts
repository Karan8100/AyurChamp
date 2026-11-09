import { useCallback, useEffect, useState } from 'react'
import { cachedAuthFetch, getCached } from '../lib/api'

export interface VikritiResult {
  checkin_id: number
  vata_score: number
  pitta_score: number
  kapha_score: number
  vata_delta: number
  pitta_delta: number
  kapha_delta: number
  most_aggravated: string
  created_at: string
  days_ago: number
  is_stale: boolean
}

export function useVikritiStatus() {
  const [vikriti, setVikriti] = useState<VikritiResult | null>(() => getCached<VikritiResult | null>('/vikriti/latest'))
  const [loading, setLoading] = useState(() => getCached('/vikriti/latest') === null)
  const [error, setError] = useState<string | null>(null)

  const fetchLatest = useCallback(async (force = false) => {
    const token = localStorage.getItem('ayushya_token') || localStorage.getItem('ayusha_token')
    if (!token) {
      setVikriti(null)
      setLoading(false)
      return
    }

    try {
      const data = await cachedAuthFetch<VikritiResult | null>('/vikriti/latest', { forceRefresh: force })
      setVikriti(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load latest Vikriti check-in.')
      setVikriti(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLatest()
  }, [fetchLatest])

  return { vikriti, loading, error, refreshVikriti: () => fetchLatest(true) }
}

