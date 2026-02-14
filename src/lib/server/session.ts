import { RpcMiddleware } from '@effect/rpc'
import { Context, Effect, Layer, Option, Schema, pipe } from 'effect'
import { auth } from './auth'
import { DEFAULT_NATIVE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, type Language } from '$lib/features/language/schema'
import { DEFAULT_LEVEL, type Level } from '$lib/features/level/schema'
import type { UserSettingsValue } from './user-settings'

// --- Unauthenticated error ---

export class Unauthenticated extends Schema.TaggedError<Unauthenticated>()('Unauthenticated', {
  message: Schema.String
}) {}

// --- Session Context.Tag ---

type AuthUser = typeof auth.$Infer.Session.user
type AuthSession = typeof auth.$Infer.Session.session

export interface SessionValue {
  readonly user: AuthUser
  readonly session: AuthSession
}

export class Session extends Context.Tag('Session')<Session, SessionValue>() {}

// --- Auth Middleware ---

export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()('AuthMiddleware', {
  provides: Session,
  failure: Unauthenticated
}) {}

export const AuthMiddlewareLive: Layer.Layer<AuthMiddleware> = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of(({ headers }) =>
    pipe(
      Effect.tryPromise({
        try: () => auth.api.getSession({ headers: new globalThis.Headers(headers as Record<string, string>) }),
        catch: () => new Unauthenticated({ message: 'Session lookup failed' })
      }),
      Effect.flatMap((result) =>
        pipe(
          Option.fromNullable(result),
          Option.match({
            onNone: () => Effect.fail(new Unauthenticated({ message: 'No active session' })),
            onSome: (s) => Effect.succeed({ user: s.user, session: s.session })
          })
        )
      )
    )
  )
)

// --- User settings helper ---

export const userSettingsFromUser = (user: AuthUser): UserSettingsValue => ({
  nativeLanguage: (user.nativeLanguage ?? DEFAULT_NATIVE_LANGUAGE) as Language,
  targetLanguage: (user.targetLanguage ?? DEFAULT_TARGET_LANGUAGE) as Language,
  level: (user.level ?? DEFAULT_LEVEL) as Level
})
