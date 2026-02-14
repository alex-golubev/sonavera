import { Schema } from 'effect'

// --- Messages ---

export const ConversationRole = Schema.Literal('user', 'assistant')
export type ConversationRole = typeof ConversationRole.Type

export const ConversationMessage = Schema.Struct({
  role: ConversationRole,
  content: Schema.String
})
export type ConversationMessage = typeof ConversationMessage.Type

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

export class ConversationPersisted extends Schema.TaggedClass<ConversationPersisted>()('ConversationPersisted', {
  conversationId: Schema.String
}) {}

export const ConversationStreamEvent = Schema.Union(
  ConversationTranscription,
  ConversationLlmChunk,
  ConversationLlmDone,
  ConversationAudioChunk,
  ConversationDone,
  ConversationPersisted
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
  conversationId: Schema.optional(Schema.String)
})
export type ConversationPayload = typeof ConversationPayload.Type

// --- Error ---

export const ConversationPhase = Schema.Literal('stt', 'llm', 'tts')
export type ConversationPhase = typeof ConversationPhase.Type

export class ConversationError extends Schema.TaggedError<ConversationError>()('ConversationError', {
  message: Schema.String,
  phase: ConversationPhase
}) {}
