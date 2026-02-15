import { Effect, Duration, Match, Option, Ref, Stream, pipe } from 'effect'
import type { SqlError } from '@effect/sql/SqlError'
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
  ConversationPersistFailed,
  ConversationPersisted,
  ConversationStarted,
  ConversationTranscription,
  type ConversationPayload,
  type ConversationStreamEvent
} from '../schema'

const pgErrorCode = (e: SqlError): string | undefined => {
  const cause = e.cause
  return typeof cause === 'object' && cause !== null && 'code' in cause && typeof cause.code === 'string'
    ? cause.code
    : undefined
}

const isTransient = (e: SqlError): boolean => {
  const code = pgErrorCode(e)
  return (
    code === '40P01' ||
    code === '40001' ||
    code === '55P03' ||
    (code?.startsWith('08') ?? false) ||
    (code?.startsWith('57P') ?? false)
  )
}

const MAX_CONTEXT_MESSAGES = 20
const PERSIST_TIMEOUT = Duration.seconds(10)

// Persist gate: streaming → ready → saving → saved
type PersistGate = 'streaming' | 'ready' | 'saving' | 'saved'

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

    // Pre-generated IDs
    const convId = payload.conversationId ?? crypto.randomUUID()
    const turnId = crypto.randomUUID()

    // Persist gate: atomic state machine.
    // Starts as 'streaming' — if interrupted before LLM completes, gate stays 'streaming'
    // and the finalizer skips saving, preventing partial assistant responses from being persisted.
    const gate = yield* Ref.make<PersistGate>('streaming')

    // Pure save operation (no state management)
    const saveToDB = pipe(
      Ref.get(ref),
      Effect.flatMap((assistantText) =>
        payload.conversationId
          ? repo.saveSubsequent({
              userId,
              conversationId: payload.conversationId,
              turnId,
              userText,
              assistantText
            })
          : repo.saveFirst({
              conversationId: convId,
              userId,
              turnId,
              nativeLanguage: settings.nativeLanguage,
              targetLanguage: settings.targetLanguage,
              level: settings.level,
              provider: llm.provider,
              model: llm.model,
              userText,
              assistantText
            })
      ),
      Effect.retry({ times: 2, while: (e) => e._tag === 'SqlError' && isTransient(e as SqlError) }),
      Effect.timeout(PERSIST_TIMEOUT)
    )

    // Finalizer: guaranteed persist on scope close (interrupt-safe).
    // If interrupted while persistStream's saveToDB is in-flight (gate = 'saving'),
    // both may run concurrently. The interrupted one rolls back its transaction;
    // this one completes via Effect.disconnect. ON CONFLICT DO NOTHING ensures safety.
    yield* Effect.addFinalizer(() =>
      pipe(
        Ref.modify(gate, (s): [boolean, PersistGate] =>
          s === 'ready' || s === 'saving' ? [true, 'saved'] : [false, s]
        ),
        Effect.flatMap((claimed) =>
          claimed
            ? pipe(
                saveToDB,
                Effect.tapError((e) => Effect.logError('Persist failed in finalizer', e)),
                Effect.ignore
              )
            : Effect.void
        ),
        Effect.disconnect
      )
    )

    // Early conversationId event (first turn only)
    const startedEvents: Stream.Stream<ConversationStreamEvent, ConversationError> = payload.conversationId
      ? Stream.empty
      : Stream.make(new ConversationStarted({ conversationId: convId }))

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
      Effect.tap(() => Ref.set(gate, 'ready')),
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

    // Best-effort persist in stream (atomic claim via Ref.modify)
    const persistStream: Stream.Stream<ConversationStreamEvent, ConversationError> = pipe(
      Ref.modify(gate, (s): [boolean, PersistGate] => (s === 'ready' ? [true, 'saving'] : [false, s])),
      Effect.flatMap((claimed) =>
        claimed
          ? pipe(
              saveToDB,
              Effect.tap(() => Ref.set(gate, 'saved')),
              Effect.map(
                (result): Option.Option<ConversationStreamEvent> =>
                  Option.some(new ConversationPersisted({ conversationId: result.conversationId }))
              ),
              // catchAll intentionally generalizes all errors (including ConversationAccessDenied)
              // to avoid leaking whether a conversationId exists. Server log captures the detail.
              Effect.catchAll((e) =>
                pipe(
                  Ref.set(gate, 'saved'),
                  Effect.andThen(Effect.logError('Conversation persist failed', e)),
                  Effect.map((): Option.Option<ConversationStreamEvent> => Option.some(new ConversationPersistFailed()))
                )
              )
            )
          : Effect.succeed(Option.none<ConversationStreamEvent>())
      ),
      Effect.map(
        Option.match({
          onNone: (): Stream.Stream<ConversationStreamEvent, ConversationError> => Stream.empty,
          onSome: (event): Stream.Stream<ConversationStreamEvent, ConversationError> => Stream.make(event)
        })
      ),
      Stream.unwrap
    )

    // ConversationDone is emitted before persistStream so the client can proceed immediately.
    // If the client disconnects after Done, the stream is interrupted and persistStream won't run.
    // The finalizer above (Effect.disconnect) guarantees a best-effort persist attempt on scope close.
    return pipe(
      startedEvents,
      Stream.concat(transcriptionEvents),
      Stream.concat(llmEvents),
      Stream.concat(llmDoneAndTts),
      Stream.concat(Stream.make(new ConversationDone())),
      Stream.concat(persistStream)
    )
  })
