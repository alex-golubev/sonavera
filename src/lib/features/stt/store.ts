import type { Registry } from '$lib/effect-atom'
import { Effect, pipe } from 'effect'
import { error, listening, speaking, transcribing, text, ready, vadRef } from './atoms'
import { interruptFiber } from './transcribe'
import { createVad, toggleVad } from './vad'

export { listening, speaking, transcribing, text, error, ready, initializing } from './atoms'

export const toggle = (registry: Registry.Registry, language: string) =>
  pipe(
    Effect.suspend(() => {
      const mic = registry.get(vadRef)
      return mic ? toggleVad(registry, mic) : createVad(registry, language)
    }),
    Effect.tapError((err) => Effect.sync(() => registry.set(error, String(err)))),
    Effect.ignore
  )

export const destroy = (registry: Registry.Registry) =>
  pipe(
    interruptFiber(registry),
    Effect.andThen(
      Effect.sync(() => {
        registry.get(vadRef)?.destroy()
        registry.set(vadRef, undefined)
        registry.set(listening, false)
        registry.set(speaking, false)
        registry.set(transcribing, false)
        registry.set(text, '')
        registry.set(error, '')
        registry.set(ready, false)
      })
    )
  )
