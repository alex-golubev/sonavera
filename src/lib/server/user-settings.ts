import { Context, Layer } from 'effect'
import { DEFAULT_NATIVE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, type Language } from '$lib/features/language/schema'
import { DEFAULT_LEVEL, type Level } from '$lib/features/level/schema'
import type { auth } from '$lib/server/auth'

export interface UserSettingsValue {
  readonly nativeLanguage: Language
  readonly targetLanguage: Language
  readonly level: Level
}

export class UserSettings extends Context.Tag('UserSettings')<UserSettings, UserSettingsValue>() {}

type AuthUser = typeof auth.$Infer.Session.user

export const userSettingsLayer = (user: AuthUser): Layer.Layer<UserSettings> =>
  Layer.succeed(UserSettings, {
    nativeLanguage: (user.nativeLanguage ?? DEFAULT_NATIVE_LANGUAGE) as Language,
    targetLanguage: (user.targetLanguage ?? DEFAULT_TARGET_LANGUAGE) as Language,
    level: (user.level ?? DEFAULT_LEVEL) as Level
  })

export const defaultUserSettingsLayer: Layer.Layer<UserSettings> = Layer.succeed(UserSettings, {
  nativeLanguage: DEFAULT_NATIVE_LANGUAGE,
  targetLanguage: DEFAULT_TARGET_LANGUAGE,
  level: DEFAULT_LEVEL
})
