import { HttpApi, HttpApiEndpoint, HttpApiGroup } from '@effect/platform'
import { LlmError, LlmPayload } from './schema'

const chat = HttpApiEndpoint.post('chat', '/api/llm').setPayload(LlmPayload).addError(LlmError)

export class LlmGroup extends HttpApiGroup.make('llm').add(chat) {}

export class LlmApi extends HttpApi.make('llm').add(LlmGroup) {}
