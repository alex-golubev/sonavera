import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { TtsError, TtsPayload } from './schema'

const speak = HttpApiEndpoint.post('speak', '/api/tts').setPayload(TtsPayload).addError(TtsError)

export class TtsGroup extends HttpApiGroup.make('tts').add(speak) {}

export class TtsApi extends HttpApi.make('tts').add(TtsGroup) {}
