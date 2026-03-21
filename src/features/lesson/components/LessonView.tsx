'use client'

import { Result } from '@effect-atom/atom'
import Link from 'next/link'
import { useLessonSession } from '~/features/lesson/hooks/useLessonSession'
import { LessonRoom } from './LessonRoom'

function NotStarted() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-foreground/70">Lesson is not started yet.</p>
      <Link
        href="/"
        className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Go Home
      </Link>
    </div>
  )
}

function Connecting() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-lg font-mono text-foreground/60">Connecting...</p>
    </div>
  )
}

function Failed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="text-lg text-red-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Retry
      </button>
    </div>
  )
}

function Active({
  url,
  token,
  onEnd,
  onError
}: {
  url: string
  token: string
  onEnd: () => void
  onError: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <LessonRoom url={url} token={token} onError={onError} />
      <button
        type="button"
        onClick={onEnd}
        className="rounded-full bg-red-600 px-6 py-3 text-white font-medium transition-colors hover:bg-red-700"
      >
        End Lesson
      </button>
    </div>
  )
}

export function LessonView() {
  const { connectionInfo, start, reset } = useLessonSession()

  return Result.builder(connectionInfo)
    .onWaiting(() => <Connecting />)
    .onInitial(() => <NotStarted />)
    .onError((error) => <Failed message={error.message} onRetry={start} />)
    .onDefect(() => <Failed message="Unexpected error occurred" onRetry={start} />)
    .onSuccess((value) => <Active url={value.url} token={value.token} onEnd={reset} onError={reset} />)
    .render()
}
