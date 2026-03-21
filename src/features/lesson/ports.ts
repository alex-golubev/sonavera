import { Context, type Effect } from 'effect'
import type { LiveKitTokenError } from './errors'

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
