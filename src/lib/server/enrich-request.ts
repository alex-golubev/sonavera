import type { auth } from '$lib/server/auth'

type AuthUser = typeof auth.$Infer.Session.user

export const enrichRequest = (request: Request, user: AuthUser): Request =>
  new Request(request, {
    headers: new Headers([
      ...Array.from(request.headers.entries()),
      ['x-user-native-language', user.nativeLanguage ?? 'en'],
      ['x-user-target-language', user.targetLanguage ?? 'es'],
      ['x-user-level', user.level ?? 'A1']
    ])
  })
