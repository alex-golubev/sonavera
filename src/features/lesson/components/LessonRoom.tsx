import { RoomAudioRenderer, SessionProvider, useSession } from '@livekit/components-react'
import { Cause, Effect, Exit, Scope } from 'effect'
import { TokenSource } from 'livekit-client'
import { useEffect, useMemo } from 'react'
import { SessionStartError } from '~/features/lesson/errors'
import { Transcript } from './Transcript'

const AGENT_TIMEOUT_MS = 15_000

export function LessonRoom({ url, token, onError }: { url: string; token: string; onError: () => void }) {
  const tokenSource = useMemo(() => TokenSource.literal({ serverUrl: url, participantToken: token }), [url, token])
  const session = useSession(tokenSource, { agentConnectTimeoutMilliseconds: AGENT_TIMEOUT_MS })

  useEffect(() => {
    const scope = Effect.runSync(Scope.make())
    Effect.gen(function* () {
      yield* Effect.addFinalizer(() => Effect.tryPromise(() => session.end()).pipe(Effect.ignoreLogged))
      yield* Effect.tryPromise({
        try: () => session.start(),
        catch: (cause) => new SessionStartError({ message: String(cause), cause })
      })
    }).pipe(
      Effect.catchTag('SessionStartError', () => Effect.sync(() => onError())),
      Effect.catchAllCause((cause) =>
        Cause.isInterruptedOnly(cause)
          ? Effect.succeed(void 0)
          : Effect.logError(cause).pipe(Effect.andThen(Effect.sync(() => onError())))
      ),
      Effect.provideService(Scope.Scope, scope),
      Effect.runFork
    )
    return () => {
      Scope.close(scope, Exit.void).pipe(Effect.runFork)
    }
  }, [session.start, session.end, onError])
  return (
    <SessionProvider session={session}>
      <RoomAudioRenderer />
      <Transcript />
    </SessionProvider>
  )
}
