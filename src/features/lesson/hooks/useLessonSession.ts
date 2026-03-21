'use client'

import { Atom } from '@effect-atom/atom'
import { useAtom } from '@effect-atom/atom-react'
import { useCallback } from 'react'
import { getConnectionInfo, startLessonRequest } from '~/features/lesson/atoms'

export function useLessonSession() {
  const [connectionInfo, writeConnectionInfo] = useAtom(getConnectionInfo)

  const start = useCallback(
    (language?: string) => {
      writeConnectionInfo(startLessonRequest(language))
    },
    [writeConnectionInfo]
  )

  const reset = useCallback(() => {
    writeConnectionInfo(Atom.Reset)
  }, [writeConnectionInfo])

  return { connectionInfo, start, reset }
}
