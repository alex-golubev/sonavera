import { AuthMiddleware } from '$lib/server/session'
import { ConversationRpc as BaseConversationRpc } from '../rpc'

export class ConversationRpc extends BaseConversationRpc.middleware(AuthMiddleware) {}
