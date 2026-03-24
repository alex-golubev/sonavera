'use client'

import { Atom, Result, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LessonRoom } from '~/features/lesson/components/LessonRoom'
import { startLessonAtom } from '~/features/lesson/store'

export function LessonPageGuard() {
  const result = useAtomValue(startLessonAtom)
  const set = useAtomSet(startLessonAtom)
  const router = useRouter()

  const hasToken = Result.isSuccess(result)

  useEffect(() => {
    if (!hasToken) {
      router.replace('/')
    }
  }, [hasToken, router])

  if (!hasToken) {
    return null
  }

  return (
    <LessonRoom
      token={result.value.token}
      serverUrl={result.value.serverUrl}
      onDisconnectedAction={() => {
        set(Atom.Reset)
        router.replace('/')
      }}
      onErrorAction={() => {
        set(Atom.Reset)
        router.replace('/')
      }}
    />
  )
}
