import { Context, Layer } from 'effect'
import { env } from '$env/dynamic/private'
import OpenAI from 'openai'

export class OpenAiClient extends Context.Tag('OpenAiClient')<OpenAiClient, OpenAI>() {}

export const OpenAiClientLive = Layer.succeed(OpenAiClient, new OpenAI({ apiKey: env.OPENAI_API_KEY }))
