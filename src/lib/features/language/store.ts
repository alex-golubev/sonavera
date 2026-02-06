import { Atom } from '$lib/effect-atom'
import type { Language } from './schema'

export const language = Atom.keepAlive(Atom.make<Language>('en'))
