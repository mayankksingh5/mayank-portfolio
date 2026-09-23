import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Phase = 'typing' | 'erasing'
type TypingState = { index: number; text: string; phase: Phase }

/**
 * Types each word, pauses, erases it and moves to the next. Pass a stable
 * `words` array (e.g. from useMemo). With reduced motion, shows the first word.
 */
export function useTypingAnimation(words: string[], { speed = 80, pause = 2000 } = {}) {
  const reduceMotion = usePrefersReducedMotion()
  const [state, setState] = useState<TypingState>({ index: 0, text: '', phase: 'typing' })

  useEffect(() => {
    if (reduceMotion || words.length === 0) return
    const word = words[state.index % words.length]
    let next: TypingState
    let delay: number

    if (state.phase === 'typing') {
      if (state.text.length < word.length) {
        next = { ...state, text: word.slice(0, state.text.length + 1) }
        delay = speed
      } else {
        next = { ...state, phase: 'erasing' }
        delay = pause
      }
    } else if (state.text.length > 0) {
      next = { ...state, text: state.text.slice(0, -1) }
      delay = speed / 2
    } else {
      next = { index: (state.index + 1) % words.length, text: '', phase: 'typing' }
      delay = speed
    }

    const timer = window.setTimeout(() => setState(next), delay)
    return () => window.clearTimeout(timer)
  }, [state, words, speed, pause, reduceMotion])

  return reduceMotion ? (words[0] ?? '') : state.text
}
