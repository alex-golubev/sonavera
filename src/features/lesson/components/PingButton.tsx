'use client'

import { Result } from '@effect-atom/atom'
import { useAtom } from '@effect-atom/atom-react'
import { ping } from '~/features/lesson/atoms'

export function PingButton() {
  const [result, write] = useAtom(ping)

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => write({ payload: {} })}
        className="rounded-full bg-foreground px-6 py-3 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Ping
      </button>
      <p className="text-lg font-mono">
        {Result.isInitial(result) ? 'Press the button' : Result.isSuccess(result) ? result.value.message : 'Error'}
      </p>
    </div>
  )
}
