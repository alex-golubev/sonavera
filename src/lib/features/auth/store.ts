import { goto } from '$app/navigation'
import { resolve } from '$app/paths'
import { Atom, type Registry } from '$lib/client/effect-atom'
import { Effect, pipe } from 'effect'
import { authClient } from './client'

// --- State atoms ---

export const loading = Atom.make(false)
export const error = Atom.make('')
export const success = Atom.make('')

// --- Lifecycle ---

export const resetFormState = (registry: Registry.Registry) =>
  Effect.sync(() => {
    registry.set(loading, false)
    registry.set(error, '')
    registry.set(success, '')
  })

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
        ? result.error.code === 'EMAIL_NOT_VERIFIED'
          ? pipe(
              Effect.sync(() => registry.set(loading, false)),
              Effect.andThen(() =>
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                Effect.promise(() => goto(`${resolve('/auth/verify-email')}?email=${encodeURIComponent(email)}`))
              )
            )
          : Effect.sync(() => {
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
    Effect.andThen(() => Effect.tryPromise(() => authClient.signUp.email({ ...data, callbackURL: resolve('/chat') }))),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Sign up failed')
          })
        : pipe(
            Effect.sync(() => registry.set(loading, false)),
            Effect.andThen(() =>
              // eslint-disable-next-line svelte/no-navigation-without-resolve
              Effect.promise(() => goto(`${resolve('/auth/verify-email')}?email=${encodeURIComponent(data.email)}`))
            )
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

export const resendVerificationEmail = (registry: Registry.Registry, email: string) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
      registry.set(success, '')
    }),
    Effect.andThen(() =>
      Effect.tryPromise(() => authClient.sendVerificationEmail({ email, callbackURL: resolve('/chat') }))
    ),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Failed to send verification email')
          })
        : Effect.sync(() => {
            registry.set(loading, false)
            registry.set(success, 'Verification email sent! Check your inbox.')
          })
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Failed to send verification email')
      })
    )
  )

export const requestPasswordReset = (registry: Registry.Registry, email: string) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
      registry.set(success, '')
    }),
    Effect.andThen(() =>
      Effect.tryPromise(() => authClient.requestPasswordReset({ email, redirectTo: resolve('/auth/reset-password') }))
    ),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Failed to send reset email')
          })
        : Effect.sync(() => {
            registry.set(loading, false)
            registry.set(success, 'If an account with this email exists, you will receive a reset link.')
          })
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Failed to send reset email')
      })
    )
  )

export const resetPassword = (registry: Registry.Registry, newPassword: string, token: string) =>
  pipe(
    Effect.sync(() => {
      registry.set(loading, true)
      registry.set(error, '')
    }),
    Effect.andThen(() => Effect.tryPromise(() => authClient.resetPassword({ newPassword, token }))),
    Effect.andThen((result) =>
      result.error
        ? Effect.sync(() => {
            registry.set(loading, false)
            registry.set(error, result.error?.message ?? 'Failed to reset password')
          })
        : pipe(
            Effect.sync(() => registry.set(loading, false)),
            // eslint-disable-next-line svelte/no-navigation-without-resolve
            Effect.andThen(() => Effect.promise(() => goto(`${resolve('/auth/login')}?reset=success`)))
          )
    ),
    Effect.catchAll(() =>
      Effect.sync(() => {
        registry.set(loading, false)
        registry.set(error, 'Failed to reset password')
      })
    )
  )
