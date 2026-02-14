import type { Language } from '$lib/features/language/schema'
import type { Level } from '$lib/features/level/schema'

export interface UserSettingsValue {
  readonly nativeLanguage: Language
  readonly targetLanguage: Language
  readonly level: Level
}
