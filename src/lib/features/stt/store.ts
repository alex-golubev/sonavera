import type { Registry } from '$lib/effect-atom'
import { Effect, Fiber, Option, pipe } from 'effect'
import { error, fiberRef, listening, speaking, transcribing, text, ready, vadRef } from './atoms'
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
  Effect.sync(() => {
    const fiber = registry.get(fiberRef)
    registry.set(fiberRef, undefined)
    registry.get(vadRef)?.destroy()
    registry.set(vadRef, undefined)
    registry.set(listening, false)
    registry.set(speaking, false)
    registry.set(transcribing, false)
    registry.set(text, '')
    registry.set(error, '')
    registry.set(ready, false)
    pipe(
      Option.fromNullable(fiber),
      Option.map((f) => Effect.runFork(Fiber.interrupt(f)))
    )
  })
