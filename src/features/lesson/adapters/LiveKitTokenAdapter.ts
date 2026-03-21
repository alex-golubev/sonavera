import { Config, Effect, Layer, Redacted } from 'effect'
import { AccessToken } from 'livekit-server-sdk'
import { LiveKitTokenError } from '../errors'
import { LiveKitToken } from '../ports'

const LiveKitConfig = Config.all({
  apiKey: Config.string('LIVEKIT_API_KEY'),
  apiSecret: Config.redacted('LIVEKIT_API_SECRET'),
  url: Config.string('LIVEKIT_URL')
})

export const LiveKitTokenLive = Layer.effect(
  LiveKitToken,
  Effect.gen(function* () {
    const config = yield* LiveKitConfig
    return {
      generate: ({ roomName, participantIdentity, attributes }) =>
        Effect.gen(function* () {
          const at = new AccessToken(config.apiKey, Redacted.value(config.apiSecret), {
            identity: participantIdentity,
            attributes,
            ttl: '15m'
          })
          at.addGrant({ roomJoin: true, room: roomName })
          const token = yield* Effect.promise(() => at.toJwt())
          return { url: config.url, token }
        }).pipe(Effect.mapError((error) => new LiveKitTokenError({ message: String(error) })))
    }
  })
)
