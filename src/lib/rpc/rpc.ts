import { RpcGroup } from '@effect/rpc'
import { ConversationRpc } from '$lib/features/conversation/server/rpc'

export class RootRpc extends RpcGroup.make().merge(ConversationRpc) {}
