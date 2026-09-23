import { useCallback } from 'react'

/**
 * Ref callback that adds `is-visible` to a `.reveal` element the first time it
 * scrolls into view (CSS handles the fade-up transition).
 */
export function useReveal<T extends HTMLElement>() {
  return useCallback((element: T | null) => {
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
}
