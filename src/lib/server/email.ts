import { Resend } from 'resend'
import { Data, Effect, pipe } from 'effect'
import { env } from '$env/dynamic/private'

export class ResendError extends Data.TaggedError('ResendError')<{
  readonly name: string
  readonly message: string
  readonly statusCode: number | null
}> {}

let _resend: Resend | undefined
const getResend = (): Resend => (_resend ??= new Resend(env.RESEND_API_KEY))
const getFromEmail = (): string => env.RESEND_FROM_EMAIL ?? 'Sonavera <noreply@sonavera.io>'

export const sendEmail = (to: string, subject: string, html: string): Effect.Effect<void, ResendError> =>
  pipe(
    Effect.tryPromise({
      try: () => getResend().emails.send({ from: getFromEmail(), to, subject, html }),
      catch: (e) => new ResendError({ name: 'NetworkError', message: String(e), statusCode: null })
    }),
    Effect.flatMap(({ error }) =>
      error
        ? Effect.fail(new ResendError({ name: error.name, message: error.message, statusCode: error.statusCode }))
        : Effect.void
    )
  )
