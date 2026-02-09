import { betterAuth } from 'better-auth'
import { effectSqlAdapter } from 'better-auth-effect'
import { dbRuntime } from '$lib/server/database'

export const auth = betterAuth({
  database: effectSqlAdapter({
    runtime: dbRuntime,
    dialect: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 15 * 60
    }
  },
  advanced: {
    database: {
      generateId: false
    }
  },
  user: {
    additionalFields: {
      nativeLanguage: {
        type: 'string',
        required: false,
        defaultValue: 'en',
        input: true
      },
      targetLanguage: {
        type: 'string',
        required: false,
        defaultValue: 'es',
        input: true
      },
      level: {
        type: 'string',
        required: false,
        defaultValue: 'A1',
        input: true
      }
    }
  }
})
