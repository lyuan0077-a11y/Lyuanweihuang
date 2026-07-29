import { useCallback, useEffect, useRef, useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(value))
    } catch {
      // ignore quota / serialization errors
    }
  }, [value])

  const update = useCallback((v: T | ((prev: T) => T)) => {
    setValue(v)
  }, [])

  return [value, update] as const
}
