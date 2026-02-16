import { betterAuth } from 'better-auth'
import { effectSqlAdapter } from 'better-auth-effect'
import { dbRuntime } from '$lib/server/database'
import { sendEmail } from '$lib/server/email'
import { verificationEmail, resetPasswordEmail } from '$lib/server/email-templates'
import { env } from '$env/dynamic/private'
import { DEFAULT_NATIVE_LANGUAGE, DEFAULT_TARGET_LANGUAGE } from '$lib/features/language/schema'
import { DEFAULT_LEVEL } from '$lib/features/level/schema'

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
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { subject, html } = resetPasswordEmail(user.name, url)
      await sendEmail(user.email, subject, html)
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, html } = verificationEmail(user.name, url)
      await sendEmail(user.email, subject, html)
    }
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
        defaultValue: DEFAULT_NATIVE_LANGUAGE,
        input: true
      },
      targetLanguage: {
        type: 'string',
        required: false,
        defaultValue: DEFAULT_TARGET_LANGUAGE,
        input: true
      },
      level: {
        type: 'string',
        required: false,
        defaultValue: DEFAULT_LEVEL,
        input: true
      }
    }
  }
})
