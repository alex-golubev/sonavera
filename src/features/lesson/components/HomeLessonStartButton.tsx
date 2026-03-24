'use client'

import { Result } from '@effect-atom/atom'
import { Match } from 'effect'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useLessonSession } from '~/features/lesson/hooks/useLessonSession'

export function HomeLessonStartButton() {
  const router = useRouter()
  const { connectionInfo, start, restart } = useLessonSession()

  useEffect(() => {
    router.prefetch('/lesson')
  }, [router])

  const onStart = useCallback(() => {
    Match.value(connectionInfo).pipe(
      Match.tag('Initial', ({ waiting }) => waiting || start()),
      Match.tag('Failure', ({ waiting }) => waiting || restart()),
      Match.tag('Success', () => {}),
      Match.exhaustive
    )
    router.push('/lesson')
  }, [connectionInfo, start, restart, router])

  const buttonLabel = Match.value(connectionInfo).pipe(
    Match.when({ waiting: true }, () => 'Starting Lesson...'),
    Match.tag('Success', () => 'Resume Lesson'),
    Match.orElse(() => 'Start Lesson')
  )

  const errorMessage = Result.builder(connectionInfo)
    .onError((error) => error.message)
    .onDefect(() => 'Unexpected error occurred')
    .orNull()

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
      <button
        type="button"
        onClick={onStart}
        disabled={Result.isWaiting(connectionInfo)}
        className="cursor-pointer rounded-full bg-foreground px-8 py-4 text-background text-lg font-medium transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] dark:hover:bg-[#ccc]"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
