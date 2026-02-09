import type { RequestHandler } from './$types'
import { ttsHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session ? ttsHandler(request) : new Response('Unauthorized', { status: 401 })
