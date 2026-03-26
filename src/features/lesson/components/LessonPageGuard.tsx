'use client'

import { Atom, Result, useAtomSet, useAtomSubscribe, useAtomValue } from '@effect-atom/atom-react'
import { useRouter } from 'next/navigation'
import { LessonRoom } from '~/features/lesson/components/LessonRoom'
import { startLessonAtom } from '~/features/lesson/store'

export function LessonPageGuard() {
  const result = useAtomValue(startLessonAtom)
  const set = useAtomSet(startLessonAtom)
  const router = useRouter()

  useAtomSubscribe(startLessonAtom, (r) =>
    Result.builder(r).onInitial(() => router.replace('/')).render()
  )

  const goHome = () => {
    set(Atom.Reset)
    router.replace('/')
  }

  return Result.builder(result)
    .onSuccess((value) => (
      <LessonRoom
        token={value.token}
        serverUrl={value.serverUrl}
        onDisconnectedAction={goHome}
        onErrorAction={goHome}
      />
    ))
    .render()
}
