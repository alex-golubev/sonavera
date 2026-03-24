'use client'

import { useEffect, useState } from 'react'
import { Wordmark } from '~/components/Wordmark'

function formatTime(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export function LessonHeader() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <Wordmark />
      <span className="font-mono text-sm text-neutral-500 tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.05)] dark:text-neutral-400">
        {formatTime(elapsed)}
      </span>
    </header>
  )
}
