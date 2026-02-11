import { FetchHttpClient } from '@effect/platform'
import { ManagedRuntime } from 'effect'

export const clientRuntime = ManagedRuntime.make(FetchHttpClient.layer)
