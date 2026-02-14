import type { RequestHandler } from './$types'
import { rpcHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request }) => rpcHandler(request)
