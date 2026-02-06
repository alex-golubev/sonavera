import type { RequestHandler } from './$types'
import { ttsHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request }) => ttsHandler(request)
