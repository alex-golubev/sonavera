import { Effect, Schema, pipe } from 'effect'
import type { OpenAI } from 'openai'
import { ConversationError, CorrectionItem } from '../../schema'

// -- Tool definition --

export const correctionsTool: OpenAI.Chat.Completions.ChatCompletionTool = {
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
                enum: ['grammar', 'vocabulary', 'spelling', 'word order', 'conjugation']
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

export const CorrectionsPayload = Schema.Struct({
  corrections: Schema.Array(CorrectionItem)
})

const toLlmError = (error: unknown) => new ConversationError({ message: String(error), phase: 'llm' })

export const parseCorrections = (argsJson: string) =>
  pipe(
    Effect.try({ try: () => JSON.parse(argsJson) as unknown, catch: toLlmError }),
    Effect.flatMap((parsed) => pipe(Schema.decodeUnknown(CorrectionsPayload)(parsed), Effect.mapError(toLlmError))),
    Effect.map((payload) => payload.corrections),
    Effect.tapError((e) => Effect.logWarning('Failed to parse corrections', e)),
    Effect.orElseSucceed((): ReadonlyArray<typeof CorrectionItem.Type> => [])
  )
