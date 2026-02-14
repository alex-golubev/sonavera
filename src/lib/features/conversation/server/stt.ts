import { Context, Stream } from 'effect'
import { ConversationError } from '../schema'

export class STT extends Context.Tag('STT')<
  STT,
  {
    readonly transcribeStream: (
      audio: Uint8Array,
      language: string,
      signal?: AbortSignal
    ) => Stream.Stream<string, ConversationError>
  }
>() {}
