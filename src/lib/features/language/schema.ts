import { Schema } from 'effect'

export const Language = Schema.Literal('en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh', 'ko', 'ru', 'he')
export type Language = typeof Language.Type

export const languages: ReadonlyArray<{
  readonly code: Language
  readonly name: string
  readonly nativeName: string
}> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' }
]

export const DEFAULT_NATIVE_LANGUAGE: Language = 'en'
export const DEFAULT_TARGET_LANGUAGE: Language = 'es'

export const languageName = (code: Language): string => languages.find((l) => l.code === code)?.name ?? code
