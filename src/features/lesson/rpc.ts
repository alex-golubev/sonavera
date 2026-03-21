import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'

export class PingResponse extends Schema.Class<PingResponse>('PingResponse')({
  message: Schema.String
}) {}

const Ping = Rpc.make('Ping', {
  payload: {},
  success: PingResponse
})

export class LessonRpcGroup extends RpcGroup.make(Ping) {}
