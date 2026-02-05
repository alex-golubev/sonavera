import { Effect, Layer, Stream } from 'effect'
import { LlmRpc } from '../rpc'
import { OpenAiLlm, OpenAiLlmLive } from './openai'

const LlmHandlers = LlmRpc.toLayer(
  Effect.gen(function* () {
    const llm = yield* OpenAiLlm
    return {
      Llm: ({ messages }) => llm.llmStream(messages).pipe(Stream.map((delta) => ({ text: delta })))
    }
  })
)

export const LlmLive = LlmHandlers.pipe(Layer.provide(OpenAiLlmLive))
