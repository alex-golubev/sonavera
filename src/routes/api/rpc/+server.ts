import { Context } from 'effect'
import type { RequestHandler } from './$types'
import { rpcHandler } from '$lib/server/composition'
import { UserSettings } from '$lib/server/user-settings'
import { DEFAULT_NATIVE_LANGUAGE, DEFAULT_TARGET_LANGUAGE, type Language } from '$lib/features/language/schema'
import { DEFAULT_LEVEL, type Level } from '$lib/features/level/schema'

export const POST: RequestHandler = ({ request, locals }) =>
  rpcHandler(
    request,
    Context.make(UserSettings, {
      nativeLanguage: (locals.user?.nativeLanguage ?? DEFAULT_NATIVE_LANGUAGE) as Language,
      targetLanguage: (locals.user?.targetLanguage ?? DEFAULT_TARGET_LANGUAGE) as Language,
      level: (locals.user?.level ?? DEFAULT_LEVEL) as Level
    })
  )
