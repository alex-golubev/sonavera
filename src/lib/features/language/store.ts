import { Atom, type Registry } from '$lib/effect-atom'
import { Effect } from 'effect'
import type { Language } from './schema'

export const language = Atom.make<Language>('en')

export const setLanguage = (registry: Registry.Registry, lang: Language) =>
  Effect.sync(() => registry.set(language, lang))
