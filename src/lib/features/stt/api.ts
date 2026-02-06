import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { TranscribeError, TranscribePayload, TranscribeUrlParams } from './schema'

const transcribe = HttpApiEndpoint.post('transcribe', '/api/stt')
  .setPayload(TranscribePayload)
  .setUrlParams(TranscribeUrlParams)
  .addError(TranscribeError)

export class SttGroup extends HttpApiGroup.make('stt').add(transcribe) {}

export class SttApi extends HttpApi.make('stt').add(SttGroup) {}
