import { Array as EffectArray, Option, Stream, pipe } from 'effect'
import type { OpenAI } from 'openai'
import { ConversationError, type ConversationMessage } from '../../schema'
import { systemPrompt } from '../prompt'
import { LlmContentDelta, type LlmDelta } from '../llm'
import type { UserSettingsValue } from '$lib/server/user-settings'

// -- Types --

export type ToolCallAccumulator = {
  readonly id: string
  readonly name: string
  readonly arguments: string
}

export type LlmState = {
  readonly toolCalls: ReadonlyArray<ToolCallAccumulator>
  readonly hasContent: boolean
}

// -- Pure helpers --

export const toLlmError = (error: unknown) => new ConversationError({ message: String(error), phase: 'llm' })

export const toOpenAiMessages = (
  messages: ReadonlyArray<ConversationMessage>,
  settings: UserSettingsValue
): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> => [
  { role: 'developer', content: systemPrompt(settings) },
  ...messages.map((m) => ({ role: m.role, content: m.content }))
]

export const updateAccumulators = (
  accumulators: ReadonlyArray<ToolCallAccumulator>,
  toolCalls: ReadonlyArray<OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall>
): ReadonlyArray<ToolCallAccumulator> =>
  EffectArray.reduce(toolCalls, accumulators, (acc, tc) =>
    pipe(
      EffectArray.modifyOption(acc, tc.index, (existing) => ({
        id: existing.id || (tc.id ?? ''),
        name: existing.name || (tc.function?.name ?? ''),
        arguments: existing.arguments + (tc.function?.arguments ?? '')
      })),
      Option.getOrElse(() =>
        EffectArray.insertAt(acc, tc.index, {
          id: tc.id ?? '',
          name: tc.function?.name ?? '',
          arguments: tc.function?.arguments ?? ''
        }).pipe(Option.getOrElse(() => EffectArray.append(acc, { ...tc, arguments: '' } as unknown as ToolCallAccumulator)))
      )
    )
  )

export const contentDeltas = (
  chunks: Stream.Stream<OpenAI.Chat.Completions.ChatCompletionChunk, ConversationError>
): Stream.Stream<LlmDelta, ConversationError> =>
  pipe(
    chunks,
    Stream.filterMap((chunk) => {
      const content = chunk.choices[0]?.delta?.content
      return content ? Option.some(new LlmContentDelta({ text: content })) : Option.none()
    })
  )
