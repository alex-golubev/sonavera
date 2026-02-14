import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { Atom, type Registry } from '$lib/client/effect-atom'
import { Effect, pipe } from 'effect'
import { authClient } from './client'

// --- State atoms ---

export const loading = Atom.make(false)
export const error = Atom.make('')

// --- Public API ---

export const signIn = (registry: Registry.Registry, email: string, password: string) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
    }),
    Effect.andThen(() => Effect.tryPromise(() => authClient.signIn.email({ email, password }))),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Sign in failed')
          })
        : pipe(
            Effect.sync(() => registry.set(loading, false)),
            Effect.andThen(() => Effect.promise(() => goto(resolve('/chat'))))
          )
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Sign in failed')
      })
    )
  )

export const signUp = (
  registry: Registry.Registry,
  data: {
    name: string
    email: string
    password: string
    nativeLanguage: string
    targetLanguage: string
    level: string
  }
) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
    }),
    Effect.andThen(() => Effect.tryPromise(() => authClient.signUp.email(data))),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Sign up failed')
          })
        : pipe(
            Effect.sync(() => registry.set(loading, false)),
            Effect.andThen(() => Effect.promise(() => goto(resolve('/chat'))))
          )
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Sign up failed')
      })
    )
  )

export const signOut = (registry: Registry.Registry) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
    }),
    Effect.andThen(() => Effect.tryPromise(() => authClient.signOut())),
    Effect.andThen(() =>
      pipe(
        Effect.sync(() => registry.set(loading, false)),
        Effect.andThen(() => Effect.promise(() => goto(resolve('/auth/login'))))
      )
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Sign out failed')
      })
    )
  )
