import { HttpServerRequest } from '@effect/platform'
import { Effect, Schema, pipe } from 'effect'
import { Language } from '$lib/features/language/schema'
import { Level } from '$lib/features/level/schema'

export interface UserSettings {
  readonly nativeLanguage: Language
  readonly targetLanguage: Language
  readonly level: Level
}

const UserSettingsHeaders = Schema.Struct({
  'x-user-native-language': Language,
  'x-user-target-language': Language,
  'x-user-level': Level
})

export const userSettings: Effect.Effect<UserSettings, never, HttpServerRequest.HttpServerRequest> = pipe(
  HttpServerRequest.schemaHeaders(UserSettingsHeaders),
  Effect.map((h) => ({
    nativeLanguage: h['x-user-native-language'],
    targetLanguage: h['x-user-target-language'],
    level: h['x-user-level']
  })),
  Effect.orDie
)
