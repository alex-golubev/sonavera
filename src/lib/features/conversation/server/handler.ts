import { Effect, Match, Ref, Stream, pipe } from 'effect'
import { Session, userSettingsFromUser } from '$lib/server/session'
import type { UserSettingsValue } from '$lib/server/user-settings'
import type { STT } from './stt'
import type { LLM } from './llm'
import type { TTS } from './tts'
import type { ConversationRepository } from './repository'
import {
  ConversationAudioChunk,
  ConversationDone,
  ConversationError,
  ConversationLlmChunk,
  ConversationLlmDone,
  ConversationPersisted,
  ConversationTranscription,
  type ConversationPayload,
  type ConversationStreamEvent
} from '../schema'

const MAX_CONTEXT_MESSAGES = 20
const PROVIDER = 'openai'
const MODEL = 'gpt-4.1-mini'

export const conversationHandler =
  (stt: STT['Type'], llm: LLM['Type'], tts: TTS['Type'], repo: ConversationRepository['Type']) =>
  (payload: ConversationPayload) =>
    pipe(
      Effect.gen(function* () {
        const { user } = yield* Session
        const settings = userSettingsFromUser(user)
        const controller = new AbortController()
        yield* Effect.addFinalizer(() => Effect.sync(() => controller.abort()))
        const signal = controller.signal

        // Phase 1: resolve user text
        const userText = yield* pipe(
          Match.value(payload.input),
          Match.tag('ConversationAudioInput', (input) =>
            pipe(
              stt.transcribeStream(input.data, settings.targetLanguage, signal),
              Stream.runFold('', (acc, delta) => acc + delta)
            )
          ),
          Match.tag('ConversationTextInput', (input) => Effect.succeed(input.text)),
          Match.exhaustive
        )

        // Skip empty transcriptions (sighs, background noise)
        const trimmed = userText.trim()
        return trimmed.length === 0
          ? Stream.make(new ConversationDone())
          : yield* buildEventStream(payload, trimmed, settings, user.id, llm, tts, repo, signal)
      }),
      Stream.unwrapScoped
    )

const buildEventStream = (
  payload: ConversationPayload,
  userText: string,
  settings: UserSettingsValue,
  userId: string,
  llm: LLM['Type'],
  tts: TTS['Type'],
  repo: ConversationRepository['Type'],
  signal: AbortSignal
) =>
  Effect.gen(function* () {
    const messages = [...payload.messages.slice(-MAX_CONTEXT_MESSAGES), { role: 'user' as const, content: userText }]
    const ref = yield* Ref.make('')

    const transcriptionEvents: Stream.Stream<ConversationStreamEvent, ConversationError> =
      payload.input._tag === 'ConversationAudioInput'
        ? Stream.make(new ConversationTranscription({ text: userText }))
        : Stream.empty

    const llmEvents: Stream.Stream<ConversationStreamEvent, ConversationError> = pipe(
      llm.llmStream(messages, settings, signal),
      Stream.tap((delta) => Ref.update(ref, (acc) => acc + delta)),
      Stream.map((delta) => new ConversationLlmChunk({ text: delta }))
    )

    const llmDoneAndTts: Stream.Stream<ConversationStreamEvent, ConversationError> = pipe(
      Ref.get(ref),
      Effect.map((fullText) => {
        const doneEvent: Stream.Stream<ConversationStreamEvent, ConversationError> = Stream.make(
          new ConversationLlmDone({ text: fullText })
        )
        const audioEvents: Stream.Stream<ConversationStreamEvent, ConversationError> = payload.tts
          ? pipe(
              tts.speakStream(fullText, 'coral', signal),
              Stream.map((data) => new ConversationAudioChunk({ data }))
            )
          : Stream.empty
        return pipe(doneEvent, Stream.concat(audioEvents))
      }),
      Stream.unwrap
    )

    const persistStream: Stream.Stream<ConversationStreamEvent, ConversationError> = pipe(
      Ref.get(ref),
      Effect.flatMap((assistantText) =>
        pipe(
          payload.conversationId
            ? repo.saveSubsequent({
                conversationId: payload.conversationId,
                ordinalOffset: payload.messages.length,
                userText,
                assistantText
              })
            : repo.saveFirst({
                userId,
                nativeLanguage: settings.nativeLanguage,
                targetLanguage: settings.targetLanguage,
                level: settings.level,
                provider: PROVIDER,
                model: MODEL,
                userText,
                assistantText
              }),
          Effect.map((result) => new ConversationPersisted({ conversationId: result.conversationId })),
          Effect.catchAll(() => Effect.succeed(null))
        )
      ),
      Effect.map(
        (event): Stream.Stream<ConversationStreamEvent, ConversationError> =>
          event ? Stream.make(event) : Stream.empty
      ),
      Stream.unwrap
    )

    return pipe(
      transcriptionEvents,
      Stream.concat(llmEvents),
      Stream.concat(llmDoneAndTts),
      Stream.concat(Stream.make(new ConversationDone())),
      Stream.concat(persistStream)
    )
  })
