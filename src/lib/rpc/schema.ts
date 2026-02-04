import { Schema } from 'effect'

export const Ping = Schema.Struct({
  ok: Schema.Boolean
})
