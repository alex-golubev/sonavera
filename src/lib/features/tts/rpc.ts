import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { TtsChunk, TtsError } from './schema'

export class TtsRpc extends RpcGroup.make(
  Rpc.make('Tts', {
    payload: { text: Schema.String, voice: Schema.String },
    success: TtsChunk,
    error: TtsError,
    stream: true
  })
) {}
