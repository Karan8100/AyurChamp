import { useCallback, useEffect, useState } from 'react'
import { authFetch } from '../lib/api'

export type AssessmentStatus = 'none' | 'completed'

export interface AssessmentResult {
  result_type: string
  vata_score: number
  pitta_score: number
  kapha_score: number
  phase_reached: number
  total_questions: number
}

export function useAssessmentStatus() {
  const [status, setStatusState] = useState<AssessmentStatus>(() => {
    const saved = localStorage.getItem('ayushya_assessment_status') || localStorage.getItem('ayusha_assessment_status')
    return saved === 'completed' ? 'completed' : 'none'
  })

  const [result, setResult] = useState<AssessmentResult | null>(() => {
    try {
      const savedResult = localStorage.getItem('ayushya_assessment_result') || localStorage.getItem('ayusha_assessment_result')
      return savedResult ? JSON.parse(savedResult) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(true)

  const checkStatus = useCallback(async () => {
    const token = localStorage.getItem('ayushya_token') || localStorage.getItem('ayusha_token')
    if (!token) {
      setStatusState('none')
      setResult(null)
      setLoading(false)
      return
    }

    try {
      const data = await authFetch<AssessmentResult>('/assessment/result')
      setStatusState('completed')
      setResult(data)
      localStorage.setItem('ayushya_assessment_status', 'completed')
      localStorage.removeItem('ayusha_assessment_status')
      localStorage.setItem('ayushya_assessment_result', JSON.stringify(data))
      localStorage.removeItem('ayusha_assessment_result')
    } catch {
      // 404 or unauthenticated means no completed assessment session yet
      setStatusState('none')
      setResult(null)
      localStorage.setItem('ayushya_assessment_status', 'none')
      localStorage.removeItem('ayusha_assessment_status')
      localStorage.removeItem('ayushya_assessment_result')
      localStorage.removeItem('ayusha_assessment_result')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const setStatus = (newStatus: AssessmentStatus, newResult: AssessmentResult | null = null) => {
    setStatusState(newStatus)
    setResult(newResult)
    localStorage.setItem('ayushya_assessment_status', newStatus)
    localStorage.removeItem('ayusha_assessment_status')
    if (newResult) {
      localStorage.setItem('ayushya_assessment_result', JSON.stringify(newResult))
      localStorage.removeItem('ayusha_assessment_result')
    } else if (newStatus === 'none') {
      localStorage.removeItem('ayushya_assessment_result')
      localStorage.removeItem('ayusha_assessment_result')
    }
  }

  return { status, result, loading, setStatus, refreshStatus: checkStatus }
}
