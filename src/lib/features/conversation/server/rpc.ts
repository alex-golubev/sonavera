import { Rpc, RpcGroup } from '@effect/rpc'
import { AuthMiddleware } from '$lib/server/session'
import { ConversationError, ConversationPayload, ConversationStreamEvent } from '../schema'

export class ConversationRpc extends RpcGroup.make(
  Rpc.make('conversationStream', {
    payload: ConversationPayload,
    success: ConversationStreamEvent,
    error: ConversationError,
    stream: true
  })
).middleware(AuthMiddleware) {}
