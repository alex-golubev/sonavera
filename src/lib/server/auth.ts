import { betterAuth } from 'better-auth'
import { effectSqlAdapter } from 'better-auth-effect'
import { dbRuntime } from '$lib/server/database'
import { env } from '$env/dynamic/private'

const getBaseURL = (): string =>
  env.BETTER_AUTH_URL ?? (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:5173')

export const auth = betterAuth({
  baseURL: getBaseURL(),
  trustedOrigins: [
    ...(env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',').filter(Boolean) ?? []),
    ...(env.VERCEL_URL ? [`https://${env.VERCEL_URL}`] : []),
    ...(env.VERCEL_BRANCH_URL ? [`https://${env.VERCEL_BRANCH_URL}`] : []),
    ...(env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`] : [])
  ],
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
