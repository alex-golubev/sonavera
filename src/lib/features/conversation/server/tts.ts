import { Context, Stream } from 'effect'
import { ConversationError } from '../schema'

export class TTS extends Context.Tag('TTS')<
  TTS,
  {
    readonly speakStream: (
      text: string,
      voice: string,
      signal?: AbortSignal
    ) => Stream.Stream<Uint8Array, ConversationError>
  }
>() {}
