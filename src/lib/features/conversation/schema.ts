import { Schema } from 'effect'

// --- Corrections ---

export const CorrectionCategory = Schema.Literal('grammar', 'vocabulary', 'spelling', 'word order', 'conjugation')
export type CorrectionCategory = typeof CorrectionCategory.Type

export const CorrectionItem = Schema.Struct({
  category: CorrectionCategory,
  original: Schema.String,
  correction: Schema.String,
  explanation: Schema.String
})
export type CorrectionItem = typeof CorrectionItem.Type

// --- Messages ---

export const ConversationRole = Schema.Literal('user', 'assistant')
export type ConversationRole = typeof ConversationRole.Type

export const ConversationMessage = Schema.Struct({
  id: Schema.optional(Schema.String),
  role: ConversationRole,
  content: Schema.String
})
export type ConversationMessage = typeof ConversationMessage.Type

// --- Persisted data (DB → client sync) ---

export const PersistedMessage = Schema.Struct({
  id: Schema.String,
  role: ConversationRole,
  content: Schema.String
})
export type PersistedMessage = typeof PersistedMessage.Type

export const PersistedCorrection = Schema.Struct({
  messageId: Schema.String,
  category: CorrectionCategory,
  original: Schema.String,
  correction: Schema.String,
  explanation: Schema.String
})
export type PersistedCorrection = typeof PersistedCorrection.Type

// --- Stream events (server → client) ---

export class ConversationTranscription extends Schema.TaggedClass<ConversationTranscription>()(
  'ConversationTranscription',
  { text: Schema.String }
) {}

export class ConversationLlmChunk extends Schema.TaggedClass<ConversationLlmChunk>()('ConversationLlmChunk', {
  text: Schema.String
}) {}

export class ConversationLlmDone extends Schema.TaggedClass<ConversationLlmDone>()('ConversationLlmDone', {
  text: Schema.String
}) {}

export class ConversationAudioChunk extends Schema.TaggedClass<ConversationAudioChunk>()('ConversationAudioChunk', {
  data: Schema.Uint8ArrayFromSelf
}) {}

export class ConversationDone extends Schema.TaggedClass<ConversationDone>()('ConversationDone', {}) {}

export class ConversationStarted extends Schema.TaggedClass<ConversationStarted>()('ConversationStarted', {
  conversationId: Schema.String
}) {}

export class ConversationPersisted extends Schema.TaggedClass<ConversationPersisted>()('ConversationPersisted', {
  conversationId: Schema.String,
  messages: Schema.Array(PersistedMessage),
  corrections: Schema.Array(PersistedCorrection)
}) {}

export class ConversationCorrections extends Schema.TaggedClass<ConversationCorrections>()('ConversationCorrections', {
  corrections: Schema.Array(CorrectionItem)
}) {}

export class ConversationPersistFailed extends Schema.TaggedClass<ConversationPersistFailed>()(
  'ConversationPersistFailed',
  {}
) {}

export const ConversationStreamEvent = Schema.Union(
  ConversationStarted,
  ConversationTranscription,
  ConversationLlmChunk,
  ConversationLlmDone,
  ConversationCorrections,
  ConversationAudioChunk,
  ConversationDone,
  ConversationPersisted,
  ConversationPersistFailed
)
export type ConversationStreamEvent = typeof ConversationStreamEvent.Type

// --- Input (client → server) ---

export class ConversationAudioInput extends Schema.TaggedClass<ConversationAudioInput>()('ConversationAudioInput', {
  data: Schema.Uint8ArrayFromSelf
}) {}

export class ConversationTextInput extends Schema.TaggedClass<ConversationTextInput>()('ConversationTextInput', {
  text: Schema.String
}) {}

export const ConversationInput = Schema.Union(ConversationAudioInput, ConversationTextInput)
export type ConversationInput = typeof ConversationInput.Type

// --- Payload ---

export const ConversationPayload = Schema.Struct({
  messages: Schema.Array(ConversationMessage),
  input: ConversationInput,
  tts: Schema.Boolean,
  conversationId: Schema.optional(Schema.UUID)
})
export type ConversationPayload = typeof ConversationPayload.Type

// --- Error ---

export const ConversationPhase = Schema.Literal('stt', 'llm', 'tts')
export type ConversationPhase = typeof ConversationPhase.Type

export class ConversationError extends Schema.TaggedError<ConversationError>()('ConversationError', {
  message: Schema.String,
  phase: ConversationPhase
}) {}
