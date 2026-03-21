'use client'

import { Atom } from '@effect-atom/atom'
import { useAtom } from '@effect-atom/atom-react'
import { useCallback } from 'react'
import { getConnectionInfo } from '~/features/lesson/atoms'

const DEFAULT_LESSON_LANGUAGE = 'en'

export function useLessonSession() {
  const [connectionInfo, writeConnectionInfo] = useAtom(getConnectionInfo)

  const start = useCallback(
    (language: string = DEFAULT_LESSON_LANGUAGE) => {
      writeConnectionInfo({ payload: { language } })
    },
    [writeConnectionInfo]
  )

  const reset = useCallback(() => {
    writeConnectionInfo(Atom.Reset)
  }, [writeConnectionInfo])

  return { connectionInfo, start, reset }
}
