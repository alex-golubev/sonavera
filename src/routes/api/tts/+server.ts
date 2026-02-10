import type { RequestHandler } from './$types'
import { ttsHandler } from '$lib/server/composition'
import { enrichRequest } from '$lib/server/enrich-request'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session && locals.user
    ? ttsHandler(enrichRequest(request, locals.user))
    : new Response('Unauthorized', { status: 401 })
