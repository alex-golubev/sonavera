import { RpcGroup } from '@effect/rpc'
import { ConversationRpc } from '$lib/features/conversation/rpc'

export class RootRpc extends RpcGroup.make().merge(ConversationRpc) {}
