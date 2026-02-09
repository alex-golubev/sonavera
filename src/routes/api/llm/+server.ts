import type { RequestHandler } from './$types'
import { llmHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request, locals }) =>
  locals.session ? llmHandler(request) : new Response('Unauthorized', { status: 401 })
