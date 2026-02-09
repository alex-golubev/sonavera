import type { RequestHandler } from './$types'
import { sttHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session ? sttHandler(request) : new Response('Unauthorized', { status: 401 })
