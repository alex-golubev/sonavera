import type { RequestHandler } from './$types'
import { handler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request }) => handler(request)
