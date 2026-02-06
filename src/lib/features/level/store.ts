import { Atom } from '$lib/effect-atom'
import type { Level } from './schema'

export const level = Atom.keepAlive(Atom.make<Level>('A1'))
