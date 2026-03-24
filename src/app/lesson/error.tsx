'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Wordmark } from '~/components/Wordmark'

export default function LessonError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    console.error('[LessonPage] Unhandled error:', error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <Wordmark />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Something went wrong</h1>
          <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            An unexpected error occurred during your lesson.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-accent hover:bg-accent/90 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="rounded-full bg-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
