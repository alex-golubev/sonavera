import type { RequestHandler } from './$types'
import { llmHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request }) => llmHandler(request)
