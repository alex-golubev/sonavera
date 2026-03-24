import { RoomAudioRenderer, SessionProvider, useSession } from '@livekit/components-react'
import { Cause, Effect, Fiber } from 'effect'
import { TokenSource } from 'livekit-client'
import { useEffect, useMemo } from 'react'
import { SessionStartError } from '~/features/lesson/errors'
import { Transcript } from './Transcript'

const AGENT_TIMEOUT_MS = 15_000

export function LessonRoom({ url, token, onError }: { url: string; token: string; onError: () => void }) {
  const tokenSource = useMemo(() => TokenSource.literal({ serverUrl: url, participantToken: token }), [url, token])
  const session = useSession(tokenSource, { agentConnectTimeoutMilliseconds: AGENT_TIMEOUT_MS })

  useEffect(() => {
    const fiber = Effect.tryPromise({
      try: () => session.start(),
      catch: (cause) => new SessionStartError({ message: String(cause), cause })
    }).pipe(
      Effect.catchTag('SessionStartError', () => Effect.sync(() => onError())),
      Effect.catchAllCause((cause) =>
        Cause.isInterruptedOnly(cause)
          ? Effect.succeed(void 0)
          : Effect.logError(cause).pipe(Effect.andThen(Effect.sync(() => onError())))
      ),
      Effect.runFork
    )
    return () => {
      Fiber.interrupt(fiber).pipe(Effect.runFork)
      Effect.tryPromise(() => session.end()).pipe(Effect.ignoreLogged, Effect.runFork)
    }
  }, [session.start, session.end, onError])

  return (
    <SessionProvider session={session}>
      <RoomAudioRenderer />
      <Transcript />
    </SessionProvider>
  )
}
