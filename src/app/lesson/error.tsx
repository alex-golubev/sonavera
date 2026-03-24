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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <Wordmark />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">Something went wrong</h1>
          <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
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
            className="rounded-full bg-neutral-200 px-6 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
