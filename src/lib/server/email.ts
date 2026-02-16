import { Resend } from 'resend'
import { env } from '$env/dynamic/private'

let _resend: Resend | undefined
const getResend = (): Resend => (_resend ??= new Resend(env.RESEND_API_KEY))
const getFromEmail = (): string => env.RESEND_FROM_EMAIL ?? 'Sonavera <noreply@sonavera.io>'

export const sendEmail = (to: string, subject: string, html: string): Promise<void> =>
  getResend()
    .emails.send({ from: getFromEmail(), to, subject, html })
    .then(() => {})
