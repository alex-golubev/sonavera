import { Context, Data, type Effect } from 'effect'

export class LiveKitTokenError extends Data.TaggedError('LiveKitTokenError')<{
  readonly message: string
}> {}

export class LiveKitToken extends Context.Tag('LiveKitToken')<
  LiveKitToken,
  {
    readonly generate: (options: {
      readonly roomName: string
      readonly participantIdentity: string
      readonly attributes?: Record<string, string>
    }) => Effect.Effect<{ url: string; token: string }, LiveKitTokenError>
  }
>() {}
