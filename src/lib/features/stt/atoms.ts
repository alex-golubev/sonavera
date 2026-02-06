import { Atom } from '$lib/effect-atom'
import type { MicVAD } from '@ricky0123/vad-web'
import type { Fiber } from 'effect'

// --- State atoms ---

export const listening = Atom.make(false)
export const speaking = Atom.make(false)
export const transcribing = Atom.make(false)
export const text = Atom.make('')
export const error = Atom.make('')
export const ready = Atom.make(false)
export const initializing = Atom.make(false)

// --- Internal refs ---

export const vadRef = Atom.keepAlive(Atom.make<MicVAD | undefined>(undefined))
export const fiberRef = Atom.keepAlive(Atom.make<Fiber.RuntimeFiber<void, unknown> | undefined>(undefined))
