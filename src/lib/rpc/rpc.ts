import { Rpc, RpcGroup } from '@effect/rpc'
import { Ping } from './schema'

export class AppRpc extends RpcGroup.make(Rpc.make('Ping', { success: Ping })) {}
