import { HttpServer } from '@effect/platform'
import { RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer } from 'effect'
import { RootRpc } from '$lib/rpc/rpc'
import { ConversationRpc } from '$lib/features/conversation/server/rpc'
import { Stt } from '$lib/features/conversation/server/stt'
import { Llm } from '$lib/features/conversation/server/llm'
import { Tts } from '$lib/features/conversation/server/tts'
import { OpenAiSttLive } from '$lib/features/conversation/server/openai/stt'
import { OpenAiLlmLive } from '$lib/features/conversation/server/openai/llm'
import { OpenAiTtsLive } from '$lib/features/conversation/server/openai/tts'
import { conversationHandler } from '$lib/features/conversation/server/handler'

// --- Conversation RPC handler layer ---

const ConversationHandlers = ConversationRpc.toLayer(
  Effect.gen(function* () {
    const stt = yield* Stt
    const llm = yield* Llm
    const tts = yield* Tts

    return {
      conversationStream: conversationHandler(stt, llm, tts)
    }
  })
).pipe(Layer.provide(Layer.mergeAll(OpenAiSttLive, OpenAiLlmLive, OpenAiTtsLive)))

// --- RPC server ---

const RpcServerLayer = Layer.mergeAll(RpcSerialization.layerMsgPack, HttpServer.layerContext, ConversationHandlers)

export const { handler: rpcHandler } = RpcServer.toWebHandler(RootRpc, { layer: RpcServerLayer })
