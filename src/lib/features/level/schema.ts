import { Schema } from 'effect'

export const Level = Schema.Literal('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
export type Level = typeof Level.Type

export const levels: ReadonlyArray<{
  readonly code: Level
  readonly name: string
  readonly description: string
}> = [
  { code: 'A1', name: 'A1 — Beginner', description: 'Basic phrases and simple interactions' },
  { code: 'A2', name: 'A2 — Elementary', description: 'Simple everyday conversations' },
  { code: 'B1', name: 'B1 — Intermediate', description: 'Familiar topics and experiences' },
  { code: 'B2', name: 'B2 — Upper Intermediate', description: 'Abstract and complex topics' },
  { code: 'C1', name: 'C1 — Advanced', description: 'Fluent and spontaneous expression' },
  { code: 'C2', name: 'C2 — Mastery', description: 'Native-level precision and nuance' }
]

export const DEFAULT_LEVEL: Level = 'A1'
