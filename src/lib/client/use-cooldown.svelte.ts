import { Effect, Fiber, Schedule, pipe } from 'effect'

export const useCooldown = (trigger: () => string, duration = 60): (() => number) => {
  let cooldown = $state(0)

  $effect(() => {
    if (!trigger()) return

    cooldown = duration

    const fiber = Effect.runFork(
      pipe(
        Effect.sleep('1 second'),
        Effect.andThen(Effect.sync(() => (cooldown -= 1))),
        Effect.repeat(Schedule.recurs(duration - 1))
      )
    )

    return () => Effect.runFork(Fiber.interrupt(fiber))
  })

  return () => cooldown
}
