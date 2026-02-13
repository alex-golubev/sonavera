import type { RequestHandler } from './$types'
import { rpcHandler } from '$lib/server/composition'

export const POST: RequestHandler = ({ request, locals }) => {
  const headers = new Headers(request.headers)
  headers.set(
    'x-user-settings',
    JSON.stringify({
      nativeLanguage: locals.user?.nativeLanguage,
      targetLanguage: locals.user?.targetLanguage,
      level: locals.user?.level
    })
  )
  const enriched = new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error -- needed for streaming request bodies in Node
    duplex: 'half'
  })
  return rpcHandler(enriched)
}
