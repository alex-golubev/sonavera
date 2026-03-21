import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { LessonError } from './errors'

// --- GetConnectionInfo ---

export class ConnectionInfo extends Schema.Class<ConnectionInfo>('ConnectionInfo')({
  url: Schema.String,
  token: Schema.String,
  roomName: Schema.String
}) {}

const GetConnectionInfo = Rpc.make('GetConnectionInfo', {
  payload: { language: Schema.String },
  success: ConnectionInfo,
  error: LessonError
})

// --- Group ---

export class LessonRpcGroup extends RpcGroup.make(GetConnectionInfo) {}
