import { Context, Stream } from 'effect'
import { ConversationError } from '../schema'

export class Stt extends Context.Tag('Stt')<
  Stt,
  {
    readonly transcribeStream: (
      audio: Uint8Array,
      language: string,
      signal?: AbortSignal
    ) => Stream.Stream<string, ConversationError>
  }
>() {}
