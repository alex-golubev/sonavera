import { auth } from '$lib/server/auth'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { building } from '$app/environment'
import type { Handle } from '@sveltejs/kit'

import { Data, Effect, pipe } from 'effect'

class SessionError extends Data.TaggedError('SessionError')<{ cause: unknown }> { }

export const handle: Handle = ({ event, resolve }) =>
  pipe(
    Effect.gen(function* () {
      const session = yield* pipe(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: event.request.headers }),
          catch: (cause) => new SessionError({ cause })
        }),
        Effect.catchAll(() => Effect.succeed({ user: null, session: null }))
      )

      event.locals.user = session?.user ?? null
      event.locals.session = session?.session ?? null

      return yield* Effect.promise(() => svelteKitHandler({ event, resolve, auth, building }))
    }),
    Effect.runPromise
  )
