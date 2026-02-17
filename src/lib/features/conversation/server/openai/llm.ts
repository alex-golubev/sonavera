import { Effect, Layer, Option, Ref, Schema, Stream, pipe } from 'effect'
import type { OpenAI } from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError, CorrectionItem, type ConversationMessage } from '../../schema'
import { systemPrompt } from '../prompt'
import { LLM, LlmContentDelta, LlmCorrections, type LlmDelta } from '../llm'
import type { UserSettingsValue } from '$lib/server/user-settings'

// -- Constants --

const MODEL = 'gpt-4.1-mini'

// -- Types --

type ToolCallAccumulator = {
  readonly id: string
  readonly name: string
  readonly arguments: string
}

// -- Tool definition --

const correctionsTool: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'report_corrections',
    description: "Report language errors found in the user's latest message",
    parameters: {
      type: 'object',
      properties: {
        corrections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['grammar', 'vocabulary', 'spelling', 'word_order', 'conjugation']
              },
              original: { type: 'string', description: "The incorrect fragment from the user's message" },
              correction: { type: 'string', description: 'The corrected version' },
              explanation: { type: 'string', description: "Brief explanation in the user's native language" }
            },
            required: ['category', 'original', 'correction', 'explanation']
          }
        }
      },
      required: ['corrections']
    }
  }
}

// -- Schema validation --

const CorrectionsPayload = Schema.Struct({
  corrections: Schema.Array(CorrectionItem)
})

// -- Pure helpers --

const toLlmError = (error: unknown) => new ConversationError({ message: String(error), phase: 'llm' })

const toOpenAiMessages = (
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue
): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> => [
  { role: 'developer', content: systemPrompt(settings) },
  ...messages.map((m) => ({ role: m.role, content: m.content }))
]

const parseCorrections = (argsJson: string) =>
  pipe(
    Effect.try({ try: () => JSON.parse(argsJson) as unknown, catch: toLlmError }),
    Effect.flatMap((parsed) => pipe(Schema.decodeUnknown(CorrectionsPayload)(parsed), Effect.mapError(toLlmError))),
    Effect.map((payload) => payload.corrections),
    Effect.tapError((e) => Effect.logWarning('Failed to parse corrections', e)),
    Effect.orElseSucceed((): ReadonlyArray<typeof CorrectionItem.Type> => [])
  )

const updateAccumulators = (
  accumulators: ReadonlyArray<ToolCallAccumulator>,
  toolCalls: ReadonlyArray<OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall>
): ReadonlyArray<ToolCallAccumulator> =>
  toolCalls.reduce<ReadonlyArray<ToolCallAccumulator>>((accs, tc) => {
    const idx = tc.index
    const existing: ToolCallAccumulator | undefined = accs[idx]
    const updated: ToolCallAccumulator = {
      id: existing?.id ?? tc.id ?? '',
      name: existing?.name ?? tc.function?.name ?? '',
      arguments: (existing?.arguments ?? '') + (tc.function?.arguments ?? '')
    }
    const copy = [...accs]
    copy[idx] = updated
    return copy
  }, accumulators)

const contentDeltas = (
  chunks: Stream.Stream<OpenAI.Chat.Completions.ChatCompletionChunk, ConversationError>
): Stream.Stream<LlmDelta, ConversationError> =>
  pipe(
    chunks,
    Stream.filterMap((chunk) => {
      const content = chunk.choices[0]?.delta?.content
      return content ? Option.some(new LlmContentDelta({ text: content })) : Option.none()
    })
  )

// -- OpenAI API calls --

const createCompletion = (
  client: OpenAI,
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue,
  signal?: AbortSignal
) =>
  Effect.tryPromise({
    try: () =>
      client.chat.completions.create(
        {
          model: MODEL,
          stream: true,
          tools: [correctionsTool],
          tool_choice: 'auto',
          parallel_tool_calls: false,
          messages: toOpenAiMessages(messages, settings)
        },
        { signal }
      ),
    catch: toLlmError
  })

const createFollowUp = (
  client: OpenAI,
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue,
  toolCall: ToolCallAccumulator,
  signal?: AbortSignal
) =>
  Effect.tryPromise({
    try: () =>
      client.chat.completions.create(
        {
          model: MODEL,
          stream: true,
          messages: [
            ...toOpenAiMessages(messages, settings),
            {
              role: 'assistant',
              content: null,
              tool_calls: [
                { id: toolCall.id, type: 'function', function: { name: toolCall.name, arguments: toolCall.arguments } }
              ]
            },
            { role: 'tool', tool_call_id: toolCall.id, content: 'Corrections reported successfully.' }
          ]
        },
        { signal }
      ),
    catch: toLlmError
  })

// -- Service layer --

export const OpenAiLlmLive = Layer.effect(
  LLM,
  Effect.gen(function* () {
    const client = yield* OpenAiClient

    return LLM.of({
      provider: 'openai',
      model: MODEL,
      llmStream: (messages, settings, signal) =>
        pipe(
          Effect.gen(function* () {
            const toolCallsRef = yield* Ref.make<ReadonlyArray<ToolCallAccumulator>>([])
            const hasContentRef = yield* Ref.make(false)
            const response = yield* createCompletion(client, messages, settings, signal)
            const chunks = Stream.fromAsyncIterable(response, toLlmError)

            // Phase 1: stream content deltas, accumulate tool calls silently
            const mainStream: Stream.Stream<LlmDelta, ConversationError> = pipe(
              chunks,
              Stream.tap((chunk) => {
                const delta = chunk.choices[0]?.delta
                const toolCalls = delta?.tool_calls ?? []
                const hasContent = delta?.content != null
                return pipe(
                  toolCalls.length > 0
                    ? Ref.update(toolCallsRef, (accs) => updateAccumulators(accs, toolCalls))
                    : Effect.void,
                  Effect.andThen(hasContent ? Ref.set(hasContentRef, true) : Effect.void)
                )
              }),
              Stream.filterMap((chunk) => {
                const content = chunk.choices[0]?.delta?.content
                return content ? Option.some<LlmDelta>(new LlmContentDelta({ text: content })) : Option.none()
              })
            )

            // Phase 2: parse corrections from accumulated tool calls
            const correctionsStream: Stream.Stream<LlmDelta, ConversationError> = pipe(
              Ref.get(toolCallsRef),
              Effect.flatMap((toolCalls) => {
                const reportCall = toolCalls.find((tc) => tc.name === 'report_corrections')
                return reportCall && reportCall.arguments.length > 0
                  ? pipe(
                      parseCorrections(reportCall.arguments),
                      Effect.map(
                        (items): Stream.Stream<LlmDelta, ConversationError> =>
                          items.length > 0 ? Stream.make(new LlmCorrections({ corrections: items })) : Stream.empty
                      )
                    )
                  : Effect.succeed(Stream.empty as Stream.Stream<LlmDelta, ConversationError>)
              }),
              Stream.unwrap
            )

            // Phase 3: follow-up call if model returned only tool call (no content)
            const followUpStream: Stream.Stream<LlmDelta, ConversationError> = pipe(
              Effect.all({ toolCalls: Ref.get(toolCallsRef), hasContent: Ref.get(hasContentRef) }),
              Effect.flatMap(({ toolCalls, hasContent }) => {
                const reportCall = toolCalls.find((tc) => tc.name === 'report_corrections')
                return !hasContent && reportCall && reportCall.id.length > 0
                  ? pipe(
                      createFollowUp(client, messages, settings, reportCall, signal),
                      Effect.map((followUpResponse) =>
                        contentDeltas(Stream.fromAsyncIterable(followUpResponse, toLlmError))
                      )
                    )
                  : Effect.succeed(Stream.empty as Stream.Stream<LlmDelta, ConversationError>)
              }),
              Stream.unwrap
            )

            return pipe(mainStream, Stream.concat(correctionsStream), Stream.concat(followUpStream))
          }),
          Stream.unwrap
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
