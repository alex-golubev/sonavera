import * as Data from 'effect/Data'
import * as Stream from 'effect/Stream'

export const TIMEOUT = '15 seconds' as const

export class StreamStallError extends Data.TaggedError('StreamStallError')<{
  readonly message: string
}> {}

export const withStallTimeout = <A, E, R>(stream: Stream.Stream<A, E, R>) =>
  Stream.timeoutFail(stream, () => new StreamStallError({ message: 'No data received for 15 seconds' }), TIMEOUT)
