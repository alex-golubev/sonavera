import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer } from 'effect'
import { RootRpc } from '$lib/rpc/rpc'
import { ConversationRpc } from '$lib/features/conversation/server/rpc'
import { STT } from '$lib/features/conversation/server/stt'
import { LLM } from '$lib/features/conversation/server/llm'
import { TTS } from '$lib/features/conversation/server/tts'
import { OpenAiSttLive } from '$lib/features/conversation/server/openai/stt'
import { OpenAiLlmLive } from '$lib/features/conversation/server/openai/llm'
import { OpenAiTtsLive } from '$lib/features/conversation/server/openai/tts'
import { conversationHandler } from '$lib/features/conversation/server/handler'
import { defaultUserSettingsLayer } from '$lib/server/user-settings'

// --- Conversation RPC handler layer ---

const ConversationHandlers = ConversationRpc.toLayer(
  Effect.gen(function* () {
    const stt = yield* STT
    const llm = yield* LLM
    const tts = yield* TTS

    return {
      conversationStream: conversationHandler(stt, llm, tts)
    }
  })
).pipe(Layer.provide(Layer.mergeAll(OpenAiSttLive, OpenAiLlmLive, OpenAiTtsLive, defaultUserSettingsLayer)))

// --- RPC server ---

const RpcServerLayer = Layer.mergeAll(RpcSerialization.layerMsgPack, HttpServer.layerContext, ConversationHandlers)

export const { handler: rpcHandler } = RpcServer.toWebHandler(RootRpc, { layer: RpcServerLayer })
