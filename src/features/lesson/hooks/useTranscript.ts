import { useSessionMessages } from '@livekit/components-react'
import { useEffect, useRef, useState } from 'react'

export function useTranscript() {
  const { messages } = useSessionMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  useEffect(() => {
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setIsAtBottom(entry.isIntersecting), { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (messages.length > 0 && isAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAtBottom])

  return { messages, scrollRef, bottomRef }
}
