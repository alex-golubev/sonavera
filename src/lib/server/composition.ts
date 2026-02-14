import { HttpServer } from '@effect/platform'
import { RpcGroup, RpcSerialization, RpcServer } from '@effect/rpc'
import { Effect, Layer } from 'effect'
import { ConversationRpc } from '$lib/features/conversation/server/rpc'
import { STT } from '$lib/features/conversation/server/stt'
import { LLM } from '$lib/features/conversation/server/llm'
import { TTS } from '$lib/features/conversation/server/tts'
import { ConversationRepository } from '$lib/features/conversation/server/repository'
import { OpenAiSttLive } from '$lib/features/conversation/server/openai/stt'
import { OpenAiLlmLive } from '$lib/features/conversation/server/openai/llm'
import { OpenAiTtsLive } from '$lib/features/conversation/server/openai/tts'
import { ConversationRepositoryLive } from '$lib/features/conversation/server/repository-live'
import { conversationHandler } from '$lib/features/conversation/server/handler'
import { AuthMiddlewareLive } from '$lib/server/session'
import { DatabaseLive } from '$lib/server/database'

// --- Conversation RPC handler layer ---

const ConversationHandlers = ConversationRpc.toLayer(
  Effect.gen(function* () {
    const stt = yield* STT
    const llm = yield* LLM
    const tts = yield* TTS
    const repo = yield* ConversationRepository

    return {
      conversationStream: conversationHandler(stt, llm, tts, repo)
    }
  })
).pipe(
  Layer.provide(Layer.mergeAll(OpenAiSttLive, OpenAiLlmLive, OpenAiTtsLive, ConversationRepositoryLive)),
  Layer.provide(DatabaseLive)
)

// --- RPC server ---

const RpcServerLayer = Layer.mergeAll(
  RpcSerialization.layerMsgPack,
  HttpServer.layerContext,
  ConversationHandlers,
  AuthMiddlewareLive
)

class RootRpc extends RpcGroup.make().merge(ConversationRpc) {}

export const { handler: rpcHandler } = RpcServer.toWebHandler(RootRpc, { layer: RpcServerLayer })
