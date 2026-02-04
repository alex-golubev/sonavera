import { Atom } from '$lib/effect-atom'

export const counterAtom = Atom.make(0)

export const doubledAtom = Atom.readable((get) => get(counterAtom) * 2)
