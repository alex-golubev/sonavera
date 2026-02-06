import { Context, Layer } from 'effect'
import { OPENAI_API_KEY } from '$env/static/private'
import OpenAI from 'openai'

export class OpenAiClient extends Context.Tag('OpenAiClient')<OpenAiClient, OpenAI>() {}

export const OpenAiClientLive = Layer.succeed(OpenAiClient, new OpenAI({ apiKey: OPENAI_API_KEY }))
