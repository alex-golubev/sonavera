import { HttpApiBuilder, HttpServer } from '@effect/platform'
import { Layer } from 'effect'
import { LlmApi } from '$lib/features/llm/api'
import { LlmLive } from '$lib/features/llm/server/handler'
import { SttApi } from '$lib/features/stt/api'
import { SttLive } from '$lib/features/stt/server/handler'
import { TtsApi } from '$lib/features/tts/api'
import { TtsLive } from '$lib/features/tts/server/handler'

// HttpApi (STT)
const SttApiLive = HttpApiBuilder.api(SttApi).pipe(Layer.provide(SttLive))
const SttServerLayer = Layer.mergeAll(SttApiLive, HttpServer.layerContext)
export const { handler: sttHandler } = HttpApiBuilder.toWebHandler(SttServerLayer)

// HttpApi (LLM)
const LlmApiLive = HttpApiBuilder.api(LlmApi).pipe(Layer.provide(LlmLive))
const LlmServerLayer = Layer.mergeAll(LlmApiLive, HttpServer.layerContext)
export const { handler: llmHandler } = HttpApiBuilder.toWebHandler(LlmServerLayer)

// HttpApi (TTS)
const TtsApiLive = HttpApiBuilder.api(TtsApi).pipe(Layer.provide(TtsLive))
const TtsServerLayer = Layer.mergeAll(TtsApiLive, HttpServer.layerContext)
export const { handler: ttsHandler } = HttpApiBuilder.toWebHandler(TtsServerLayer)
