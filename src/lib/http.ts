import { Data, Effect, Stream } from 'effect'

export const TIMEOUT = '15 seconds' as const

export class StreamStallError extends Data.TaggedError('StreamStallError')<{
  readonly message: string
}> {}

export const withStallTimeout = <A, E, R>(stream: Stream.Stream<A, E, R>) =>
  Stream.timeoutFail(stream, () => new StreamStallError({ message: 'No data received for 15 seconds' }), TIMEOUT)

export const fromAbortSignal = (signal: AbortSignal): Effect.Effect<void> =>
  signal.aborted
    ? Effect.void
    : Effect.async<void>((resume) => {
        const handler = () => resume(Effect.void)
        signal.addEventListener('abort', handler, { once: true })
        return Effect.sync(() => signal.removeEventListener('abort', handler))
      })
