import type { RequestHandler } from './$types'
import { handler } from '$lib/server/rpc'

export const POST: RequestHandler = ({ request }) => handler(request)
