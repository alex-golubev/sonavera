'use client'

import { Result } from '@effect-atom/atom'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useLessonSession } from '~/features/lesson/hooks/useLessonSession'

type StartAction = 'navigate' | 'start' | 'restart'

function resolveStartAction(result: Result.Result<unknown, unknown>): StartAction {
  switch (result._tag) {
    case 'Success':
      return 'navigate'
    case 'Failure':
      return result.waiting ? 'navigate' : 'restart'
    case 'Initial':
      return result.waiting ? 'navigate' : 'start'
  }
}

export function HomeLessonStartButton() {
  const router = useRouter()
  const { connectionInfo, start, reset } = useLessonSession()

  useEffect(() => {
    router.prefetch('/lesson')
  }, [router])

  const onStart = useCallback(() => {
    const goToLesson = () => router.push('/lesson')
    const action = resolveStartAction(connectionInfo)
    switch (action) {
      case 'navigate':
        goToLesson()
        return
      case 'start':
        start()
        goToLesson()
        return
      case 'restart':
        reset()
        start()
        goToLesson()
    }
  }, [connectionInfo, start, reset, router])

  const isWaiting = Result.isWaiting(connectionInfo)

  const isActive = Result.isSuccess(connectionInfo)

  const errorMessage = Result.builder(connectionInfo)
    .onError((error) => error.message)
    .onDefect(() => 'Unexpected error occurred')
    .orNull()

  const buttonLabel = isWaiting ? 'Starting Lesson...' : isActive ? 'Resume Lesson' : 'Start Lesson'

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
      <button
        type="button"
        onClick={onStart}
        disabled={isWaiting}
        className="rounded-full bg-foreground px-8 py-4 text-background text-lg font-medium transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-[#ccc]"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
