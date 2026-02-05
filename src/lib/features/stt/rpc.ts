import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { TranscribeChunk, TranscribeError } from './schema'

export class SttRpc extends RpcGroup.make(
  Rpc.make('Transcribe', {
    payload: { audio: Schema.Uint8ArrayFromBase64, language: Schema.String },
    success: TranscribeChunk,
    error: TranscribeError,
    stream: true
  })
) {}
