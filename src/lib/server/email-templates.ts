const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const layout = (content: string): string => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    ${content}
  </div>
`

const button = (href: string, label: string): string =>
  `<a href="${href}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #4f46e5, #c026d3); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">${label}</a>`

export const verificationEmail = (userName: string, url: string): { subject: string; html: string } => ({
  subject: 'Verify your Sonavera email',
  html: layout(`
    <h2 style="color: #1f2937;">Verify your email</h2>
    <p style="color: #4b5563;">Hi ${escapeHtml(userName)},</p>
    <p style="color: #4b5563;">Welcome to Sonavera! Please verify your email address to get started:</p>
    ${button(url, 'Verify email')}
    <p style="color: #9ca3af; font-size: 14px;">This link expires in 1 hour. If you didn't create an account, you can safely ignore this email.</p>
  `)
})

export const resetPasswordEmail = (userName: string, url: string): { subject: string; html: string } => ({
  subject: 'Reset your Sonavera password',
  html: layout(`
    <h2 style="color: #1f2937;">Reset your password</h2>
    <p style="color: #4b5563;">Hi ${escapeHtml(userName)},</p>
    <p style="color: #4b5563;">We received a request to reset your password. Click the button below to choose a new one:</p>
    ${button(url, 'Reset password')}
    <p style="color: #9ca3af; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `)
})
