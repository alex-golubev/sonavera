/**
 * Test counter-store using @effect-atom
 */

import { Atom } from '$lib/effect-atom'

// Simple writable counter
export const counterAtom = Atom.make(0)

// Derived atom that doubles the counter
export const doubledAtom = Atom.readable((get) => get(counterAtom) * 2)
