import { Atom } from '$lib/client/effect-atom'
import type { MicVAD } from '@ricky0123/vad-web'
import type { Fiber } from 'effect'
import type { PCMPlayer } from './pcm-player'
import type { ConversationMessage, CorrectionItem } from '../schema'

// --- Mic / VAD ---

export const listening = Atom.make(false)
export const speaking = Atom.make(false)
export const initializing = Atom.make(false)
export const vadReady = Atom.make(false)

// --- Pipeline state ---

export type ConversationPhaseValue = 'idle' | 'transcribing' | 'responding' | 'speaking'
export const phase = Atom.make<ConversationPhaseValue>('idle')
export const transcription = Atom.make('')

// --- Messages ---

export const messages = Atom.make<ReadonlyArray<ConversationMessage>>([])
export const streamingText = Atom.make('')

// --- Corrections ---

export const corrections = Atom.make<ReadonlyMap<string, ReadonlyArray<CorrectionItem>>>(new Map())
export const pendingCorrections = Atom.make<ReadonlyMap<number, ReadonlyArray<CorrectionItem>>>(new Map())

// --- Audio playback ---

export const muted = Atom.make(false)

// --- Error ---

export const error = Atom.make('')
export const persistFailed = Atom.make(false)

// --- Internal refs (keepAlive to prevent GC) ---

export const conversationId = Atom.keepAlive(Atom.make<string | undefined>(undefined))
export const vadRef = Atom.keepAlive(Atom.make<MicVAD | undefined>(undefined))
export const fiberRef = Atom.keepAlive(Atom.make<Fiber.RuntimeFiber<void, unknown> | undefined>(undefined))
export const playerRef = Atom.keepAlive(Atom.make<PCMPlayer | undefined>(undefined))
