import type { RequestHandler } from './$types'
import { sttHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request }) => sttHandler(request)
