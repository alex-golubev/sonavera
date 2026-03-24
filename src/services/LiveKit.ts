import { Config, Context, Effect, Layer } from 'effect'
import { AccessToken, type CreateOptions, RoomServiceClient, type VideoGrant } from 'livekit-server-sdk'
import { RoomCreationError, TokenGenerationError } from '~/features/lesson/errors'

const EMPTY_TIMEOUT = 30
const TOKEN_TTL = '15m'

const makeRoomName = (lessonId: string, suffix: string): string => `${lessonId}-${suffix}`

const roomOptions = (roomName: string): CreateOptions => ({
  name: roomName,
  emptyTimeout: EMPTY_TIMEOUT
})

const participantGrants = (roomName: string): VideoGrant => ({
  roomJoin: true,
  room: roomName,
  canPublish: true,
  canSubscribe: true
})

const makeAccessToken =
  (apiKey: string, apiSecret: string) =>
  (identity: string, roomName: string, attributes?: Record<string, string>): AccessToken => {
    const at = new AccessToken(apiKey, apiSecret, { identity, ttl: TOKEN_TTL, attributes })
    at.addGrant(participantGrants(roomName))
    return at
  }

const createRoom = (roomService: RoomServiceClient, roomName: string) =>
  Effect.tryPromise({
    try: () => roomService.createRoom(roomOptions(roomName)),
    catch: (error) => new RoomCreationError({ message: `Failed to create room: ${error}` })
  })

const signToken = (accessToken: AccessToken) =>
  Effect.tryPromise({
    try: () => accessToken.toJwt(),
    catch: (error) => new TokenGenerationError({ message: `Failed to generate token: ${error}` })
  })

export class LiveKitService extends Context.Tag('LiveKitService')<
  LiveKitService,
  {
    readonly createLessonRoom: (
      lessonId: string,
      participantName: string,
      attributes?: Record<string, string>
    ) => Effect.Effect<{ token: string; roomName: string }, RoomCreationError | TokenGenerationError>
    readonly serverUrl: string
  }
>() {}

export const LiveKitLive = Layer.effect(
  LiveKitService,
  Effect.all({
    apiKey: Config.string('LIVEKIT_API_KEY'),
    apiSecret: Config.string('LIVEKIT_API_SECRET'),
    serverUrl: Config.string('LIVEKIT_URL')
  }).pipe(
    Effect.tapError((e) => Effect.logError('LiveKit config missing', e)),
    Effect.map(({ apiKey, apiSecret, serverUrl }) => {
      const roomService = new RoomServiceClient(serverUrl, apiKey, apiSecret)
      const buildToken = makeAccessToken(apiKey, apiSecret)

      return LiveKitService.of({
        serverUrl,
        createLessonRoom: (lessonId, participantName, attributes) =>
          Effect.gen(function* () {
            const roomName = makeRoomName(lessonId, crypto.randomUUID().slice(0, 8))
            yield* createRoom(roomService, roomName)
            const token = yield* signToken(buildToken(participantName, roomName, attributes))
            return { token, roomName }
          })
      })
    })
  )
)
