import { Context, Stream } from 'effect'
import { ConversationError } from '../schema'

export class Tts extends Context.Tag('Tts')<
  Tts,
  {
    readonly speakStream: (
      text: string,
      voice: string,
      signal?: AbortSignal
    ) => Stream.Stream<Uint8Array, ConversationError>
  }
>() {}
