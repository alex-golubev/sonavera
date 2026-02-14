import type { RequestHandler } from './$types'
import { rpcHandler } from '$lib/server/composition'
import { RpcRequestSession } from '$lib/server/session'
import { Context } from 'effect'

export const POST: RequestHandler = ({ request, locals }) => {
  const session = locals.user && locals.session ? { user: locals.user, session: locals.session } : null
  return rpcHandler(request, Context.make(RpcRequestSession, session))
}
