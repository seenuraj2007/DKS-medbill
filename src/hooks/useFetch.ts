/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  revalidateOnFocus?: boolean
  dedupingInterval?: number
  cacheTime?: number
}

interface FetchState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isValidating: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()

function getCachedData<T>(key: string, cacheTime: number): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cacheTime) {
    return cached.data
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    revalidateOnFocus = true,
    dedupingInterval = 2000,
    cacheTime = 5 * 60 * 1000 // 5 minutes
  } = options

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: !!url,
    isValidating: false
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const lastFetchRef = useRef<number>(0)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(async (skipCache = false) => {
    if (!url) return

    const now = Date.now()
    
    // Deduping: skip if already fetching within interval
    if (!skipCache && now - lastFetchRef.current < dedupingInterval) {
      return
    }

    // Check cache first
    if (!skipCache) {
      const cached = getCachedData<T>(url, cacheTime)
      if (cached) {
        setState(prev => ({ ...prev, data: cached, isLoading: false }))
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    lastFetchRef.current = now

    setState(prev => ({ ...prev, isValidating: true }))

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (isMountedRef.current) {
        setCachedData(url, data)
        setState({
          data,
          error: null,
          isLoading: false,
          isValidating: false
        })
        onSuccess?.(data)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      if (isMountedRef.current) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch')
        setState(prev => ({
          ...prev,
          error: fetchError,
          isLoading: false,
          isValidating: false
        }))
        onError?.(fetchError)
      }
    }
  }, [url, onSuccess, onError, dedupingInterval, cacheTime])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true
    
    if (url) {
      fetchData()
    } else {
      setState({
        data: null,
        error: null,
        isLoading: false,
        isValidating: false
      })
    }

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [url, fetchData])

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || !url) return

    const handleFocus = () => {
      fetchData(true)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [url, revalidateOnFocus, fetchData])

  // Manual revalidate function
  const revalidate = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Mutate function for optimistic updates
  const mutate = useCallback(async (
    updater: T | ((current: T | null) => T),
    shouldRevalidate = true
  ) => {
    const newData = typeof updater === 'function' 
      ? (updater as Function)(state.data)
      : updater

    setState(prev => ({ ...prev, data: newData }))
    
    if (url) {
      setCachedData(url, newData)
    }

    if (shouldRevalidate) {
      await fetchData(true)
    }
  }, [state.data, url, fetchData])

  return {
    ...state,
    revalidate,
    mutate
  }
}

// Hook for paginated data
export function usePaginatedFetch<T>(
  baseUrl: string,
  options: UseFetchOptions<T[]> & { pageSize?: number } = {}
) {
  const { pageSize = 20, ...fetchOptions } = options
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState<T[]>([])

  const url = `${baseUrl}?page=${page}&pageSize=${pageSize}`
  const { data, error, isLoading, isValidating, revalidate, mutate } = useFetch<T[]>(url, fetchOptions)

  useEffect(() => {
    if (data) {
      setAllData(prev => page === 1 ? data : [...prev, ...data])
    }
  }, [data, page])

  const loadMore = useCallback(() => {
    if (!isLoading && !isValidating) {
      setPage(p => p + 1)
    }
  }, [isLoading, isValidating])

  const reset = useCallback(() => {
    setPage(1)
    setAllData([])
  }, [])

  return {
    data: allData,
    error,
    isLoading,
    isValidating,
    loadMore,
    reset,
    revalidate,
    mutate,
    page,
    hasMore: data ? data.length === pageSize : false
  }
}

// Hook for auto-refreshing data
export function useAutoRefresh<T>(
  url: string | null,
  interval: number = 30000, // 30 seconds
  options: UseFetchOptions<T> = {}
) {
  const { data, error, isLoading, revalidate } = useFetch<T>(url, options)

  useEffect(() => {
    if (!url || interval <= 0) return

    const timer = setInterval(() => {
      revalidate()
    }, interval)

    return () => clearInterval(timer)
  }, [url, interval, revalidate])

  return { data, error, isLoading, revalidate }
}
