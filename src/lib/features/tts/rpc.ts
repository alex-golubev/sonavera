import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'
import { TtsChunk, TtsError, TtsVoice } from './schema'

export class TtsRpc extends RpcGroup.make(
  Rpc.make('Tts', {
    payload: { text: Schema.String, voice: TtsVoice },
    success: TtsChunk,
    error: TtsError,
    stream: true
  })
) {}
