import { error } from '@sveltejs/kit'
import { Effect } from 'effect'
import { ConversationRepository } from '$lib/features/conversation/server/repository'
import { ConversationRepositoryLive } from '$lib/features/conversation/server/repository-live'
import { dbRuntime } from '$lib/server/database'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ locals, params }) => {
  const userId = locals.user?.id
  return userId
    ? dbRuntime.runPromise(
      Effect.gen(function* () {
        const repo = yield* ConversationRepository
        return yield* repo.load({ userId, conversationId: params.conversationId })
      }).pipe(
        Effect.provide(ConversationRepositoryLive),
        Effect.catchTag('ConversationAccessDenied', () => Effect.fail(error(404, 'Not found'))),
        Effect.catchTag('SqlError', () => Effect.fail(error(404, 'Not found')))
      )
    )
    : error(401, 'Unauthorized')
}
