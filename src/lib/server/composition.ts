import { HttpApiBuilder, HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Layer } from 'effect'
import { LlmApi } from '$lib/features/llm/api'
import { LlmLive } from '$lib/features/llm/server/handler'
import { SttApi } from '$lib/features/stt/api'
import { SttLive } from '$lib/features/stt/server/handler'
import { TtsLive } from '$lib/features/tts/server/handler'
import { RootRpc } from '$lib/rpc/rpc'

// RPC (TTS)
const RpcHandlersLive = Layer.mergeAll(TtsLive)
const RpcServerLayer = Layer.mergeAll(RpcHandlersLive, RpcSerialization.layerMsgPack, HttpServer.layerContext)
export const { handler: rpcHandler } = RpcServer.toWebHandler(RootRpc, { layer: RpcServerLayer })

// HttpApi (STT)
const SttApiLive = HttpApiBuilder.api(SttApi).pipe(Layer.provide(SttLive))
const SttServerLayer = Layer.mergeAll(SttApiLive, HttpServer.layerContext)
export const { handler: sttHandler } = HttpApiBuilder.toWebHandler(SttServerLayer)

// HttpApi (LLM)
const LlmApiLive = HttpApiBuilder.api(LlmApi).pipe(Layer.provide(LlmLive))
const LlmServerLayer = Layer.mergeAll(LlmApiLive, HttpServer.layerContext)
export const { handler: llmHandler } = HttpApiBuilder.toWebHandler(LlmServerLayer)
