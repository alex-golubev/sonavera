import { FetchHttpClient, HttpClient, HttpClientError } from '@effect/platform'
import { Effect, Layer, ManagedRuntime } from 'effect'

const TIMEOUT = '15 seconds' as const

const withTimeout = (client: HttpClient.HttpClient) =>
  HttpClient.transform(client, (effect, request) =>
    effect.pipe(
      Effect.timeoutFail({
        duration: TIMEOUT,
        onTimeout: () =>
          new HttpClientError.RequestError({
            request,
            reason: 'Transport',
            description: 'Connection timed out'
          })
      })
    )
  )

const HttpClientLive = Layer.effect(HttpClient.HttpClient, Effect.map(HttpClient.HttpClient, withTimeout)).pipe(
  Layer.provide(FetchHttpClient.layer)
)

export const clientRuntime = ManagedRuntime.make(HttpClientLive)
