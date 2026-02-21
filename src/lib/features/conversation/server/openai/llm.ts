import { Config, Effect, Layer, Option, Ref, Stream, pipe } from 'effect'
import type { OpenAI } from 'openai'
import { OpenAiClient, OpenAiClientLive } from '$lib/server/openai'
import { ConversationError, type ConversationMessage } from '../../schema'
import { LLM, LlmContentDelta, LlmCorrections, type LlmDelta } from '../llm'
import type { UserSettingsValue } from '$lib/server/user-settings'
import { correctionsTool, parseCorrections } from './tools'
import {
  type LlmState,
  type ToolCallAccumulator,
  contentDeltas,
  toLlmError,
  toOpenAiMessages,
  updateAccumulators
} from './helpers'

// -- OpenAI API calls --

const streamCompletion = (
  client: OpenAI,
  messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam>,
  model: string,
  options: { tools?: Array<OpenAI.Chat.Completions.ChatCompletionTool>; toolChoice?: 'auto' } = {},
  signal?: AbortSignal
) =>
  Effect.tryPromise({
    try: () =>
      client.chat.completions.create(
        {
          model,
          stream: true,
          messages,
          ...(options.tools ? { tools: options.tools, tool_choice: options.toolChoice, parallel_tool_calls: false } : {})
        },
        { signal }
      ),
    catch: toLlmError
  })

const createCompletion = (
  client: OpenAI,
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue,
  model: string,
  signal?: AbortSignal
) => streamCompletion(client, toOpenAiMessages(messages, settings), model, { tools: [correctionsTool], toolChoice: 'auto' }, signal)

const createFollowUp = (
  client: OpenAI,
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue,
  toolCall: ToolCallAccumulator,
  model: string,
  signal?: AbortSignal
) =>
  streamCompletion(
    client,
    [
      ...toOpenAiMessages(messages, settings),
      {
        role: 'assistant',
        content: null,
        tool_calls: [{ id: toolCall.id, type: 'function', function: { name: toolCall.name, arguments: toolCall.arguments } }]
      },
      { role: 'tool', tool_call_id: toolCall.id, content: 'Corrections reported successfully.' }
    ],
    model,
    {},
    signal
  )

// -- Service layer --

export const OpenAiLlmLive = Layer.effect(
  LLM,
  Effect.gen(function* () {
    const client = yield* OpenAiClient
    const model = yield* Config.string('OPENAI_MODEL').pipe(Config.withDefault('gpt-4.1-mini'))

    return LLM.of({
      provider: 'openai',
      model,
      llmStream: (messages, settings, signal) =>
        pipe(
          Effect.gen(function* () {
            const stateRef = yield* Ref.make<LlmState>({ toolCalls: [], hasContent: false })
            const response = yield* createCompletion(client, messages, settings, model, signal)
            const chunks = Stream.fromAsyncIterable(response, toLlmError)

            // Phase 1: stream content deltas, accumulate tool calls
            const mainStream: Stream.Stream<LlmDelta, ConversationError> = pipe(
              chunks,
              Stream.tap((chunk) => {
                const delta = chunk.choices[0]?.delta
                const toolCalls = delta?.tool_calls ?? []
                const hasContent = delta?.content != null

                return toolCalls.length > 0 || hasContent
                  ? Ref.update(stateRef, (state) => ({
                      toolCalls: toolCalls.length > 0 ? updateAccumulators(state.toolCalls, toolCalls) : state.toolCalls,
                      hasContent: state.hasContent || hasContent
                    }))
                  : Effect.void
              }),
              Stream.filterMap((chunk) => {
                const content = chunk.choices[0]?.delta?.content
                return content ? Option.some<LlmDelta>(new LlmContentDelta({ text: content })) : Option.none()
              })
            )

            // Phase 2: parse corrections from accumulated tool calls
            const correctionsStream = Stream.unwrap(
              Effect.gen(function* () {
                const state = yield* Ref.get(stateRef)
                const reportCall = state.toolCalls.find((tc) => tc.name === 'report_corrections')

                const items = yield* (reportCall && reportCall.arguments.length > 0
                  ? parseCorrections(reportCall.arguments)
                  : Effect.succeed([]))

                return items.length > 0
                  ? Stream.make(new LlmCorrections({ corrections: items }))
                  : (Stream.empty as Stream.Stream<LlmDelta, ConversationError>)
              })
            )

            // Phase 3: follow-up call if model returned only tool call (no content)
            const followUpStream = Stream.unwrap(
              Effect.gen(function* () {
                const state = yield* Ref.get(stateRef)
                const reportCall = state.toolCalls.find((tc) => tc.name === 'report_corrections')

                return yield* (!state.hasContent && reportCall && reportCall.id.length > 0
                  ? pipe(
                      createFollowUp(client, messages, settings, reportCall, model, signal),
                      Effect.map((followUpResponse) =>
                        contentDeltas(Stream.fromAsyncIterable(followUpResponse, toLlmError))
                      )
                    )
                  : Effect.succeed(Stream.empty as Stream.Stream<LlmDelta, ConversationError>))
              })
            )

            return pipe(mainStream, Stream.concat(correctionsStream), Stream.concat(followUpStream))
          }),
          Stream.unwrap
        )
    })
  })
).pipe(Layer.provide(OpenAiClientLive))
