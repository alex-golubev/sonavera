'use client'

import { Result, useAtomSet, useAtomSubscribe, useAtomValue } from '@effect-atom/atom-react'
import { useRouter } from 'next/navigation'
import { startLessonAtom } from '~/features/lesson/store'

const buttonClass =
  'cursor-pointer rounded-full bg-foreground px-8 py-4 text-background text-lg font-medium transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] dark:hover:bg-[#ccc]'

function ErrorWithRetry({ message, onRetryAction }: { message: string; onRetryAction: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-red-500">{message}</p>
      <button type="button" className={buttonClass} onClick={onRetryAction}>
        Retry
      </button>
    </div>
  )
}

export function HomeLessonStartButton() {
  const result = useAtomValue(startLessonAtom)
  const set = useAtomSet(startLessonAtom)
  const router = useRouter()

  useAtomSubscribe(startLessonAtom, (r) =>
    Result.builder(r)
      .onSuccess(() => router.replace('/lesson'))
      .render()
  )

  const start = () => set({ payload: { lessonId: 'demo', userName: 'User' } })

  return Result.builder(result)
    .onInitial((initial) => (
      <button type="button" className={buttonClass} disabled={initial.waiting} onClick={start}>
        {initial.waiting ? 'Starting Lesson...' : 'Start Lesson'}
      </button>
    ))
    .onSuccess(() => (
      <button type="button" className={buttonClass} disabled>
        Starting Lesson...
      </button>
    ))
    .onErrorTag('RoomCreationError', () => (
      <ErrorWithRetry message="Could not connect to the lesson server. Please try again." onRetryAction={start} />
    ))
    .onErrorTag('TokenGenerationError', () => (
      <ErrorWithRetry message="Something went wrong on our end. Please try again later." onRetryAction={start} />
    ))
    .onDefect(() => <ErrorWithRetry message="An unexpected error occurred. Please try again." onRetryAction={start} />)
    .render()
}
