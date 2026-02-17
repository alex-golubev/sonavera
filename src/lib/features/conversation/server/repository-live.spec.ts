import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { Deferred, Duration, Effect, Fiber, Layer, ManagedRuntime, pipe } from 'effect'
import { SqlClient } from '@effect/sql'
import { ConversationRepository } from './repository'
import { ConversationRepositoryLive } from './repository-live'
import { TestDatabaseLive, runMigrations, truncateAll } from '../../../test/db'

const TestLayer = ConversationRepositoryLive.pipe(Layer.provideMerge(TestDatabaseLive))
const runtime = ManagedRuntime.make(TestLayer)

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const CONVERSATION_ID = '00000000-0000-0000-0000-000000000010'

const insertTestUser = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  yield* sql`
    INSERT INTO "user" (id, name, email, email_verified)
    VALUES (${TEST_USER_ID}, 'Test User', 'test@test.com', true)
    ON CONFLICT (id) DO NOTHING
  `
})

const createConversation = Effect.gen(function* () {
  const repo = yield* ConversationRepository
  yield* repo.saveFirst({
    conversationId: CONVERSATION_ID,
    userId: TEST_USER_ID,
    nativeLanguage: 'en',
    targetLanguage: 'es',
    level: 'B1',
    provider: 'openai',
    model: 'gpt-4.1-mini',
    turnId: '00000000-0000-0000-0000-000000000100',
    userText: 'Hello',
    assistantText: 'Hola',
    corrections: []
  })
})

describe('ConversationRepository', () => {
  beforeAll(async () => {
    await runtime.runPromise(runMigrations)
  })

  beforeEach(async () => {
    await runtime.runPromise(
      Effect.gen(function* () {
        yield* truncateAll
        yield* insertTestUser
      })
    )
  })

  afterAll(async () => {
    await runtime.dispose()
  })

  it('concurrent saveSubsequent assigns sequential ordinals', async () => {
    expect.assertions(1)

    await runtime.runPromise(
      Effect.gen(function* () {
        const repo = yield* ConversationRepository
        const sql = yield* SqlClient.SqlClient

        yield* createConversation

        yield* Effect.all(
          [
            repo.saveSubsequent({
              userId: TEST_USER_ID,
              conversationId: CONVERSATION_ID,
              turnId: '00000000-0000-0000-0000-000000000101',
              userText: 'How are you?',
              assistantText: '¿Cómo estás?',
              corrections: []
            }),
            repo.saveSubsequent({
              userId: TEST_USER_ID,
              conversationId: CONVERSATION_ID,
              turnId: '00000000-0000-0000-0000-000000000102',
              userText: 'Good morning',
              assistantText: 'Buenos días',
              corrections: []
            })
          ],
          { concurrency: 'unbounded' }
        )

        const messages = yield* sql<{ ordinal: number }>`
          SELECT ordinal FROM message
          WHERE conversation_id = ${CONVERSATION_ID}
          ORDER BY ordinal
        `

        expect(messages.map((m) => m.ordinal)).toEqual([0, 1, 2, 3, 4, 5])
      })
    )
  })

  // Deterministic race simulation: an external transaction holds the conversation
  // row lock and inserts messages while repo.saveSubsequent is in-flight.
  // If saveSubsequent reads MAX(ordinal) BEFORE acquiring the lock (broken ordering),
  // it will attempt to insert a duplicate ordinal and fail with a constraint violation.
  // If saveSubsequent acquires the lock BEFORE reading (correct ordering),
  // it blocks, then reads the up-to-date MAX and inserts correctly.
  it('saveSubsequent reads ordinals only after acquiring conversation row lock', async () => {
    expect.assertions(1)

    await runtime.runPromise(
      Effect.gen(function* () {
        const repo = yield* ConversationRepository
        const sql = yield* SqlClient.SqlClient

        yield* createConversation

        const lockAcquired = yield* Deferred.make<void>()

        // T1: hold the conversation row lock, insert messages, then release
        const t1 = yield* pipe(
          sql.withTransaction(
            Effect.gen(function* () {
              yield* sql`
                UPDATE conversation SET updated_at = now()
                WHERE id = ${CONVERSATION_ID}
              `
              yield* Deferred.succeed(lockAcquired, void 0)
              yield* Effect.sleep(Duration.millis(200))

              yield* sql`
                INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
                VALUES (${CONVERSATION_ID}, gen_random_uuid(), 'user', 'T1 user', 2)
              `
              yield* sql`
                INSERT INTO message (conversation_id, turn_id, role, content, ordinal)
                VALUES (${CONVERSATION_ID}, gen_random_uuid(), 'assistant', 'T1 assistant', 3)
              `
            })
          ),
          Effect.fork
        )

        // Wait until T1 holds the lock, then call the real saveSubsequent.
        // saveSubsequent's UPDATE will block until T1 commits.
        yield* Deferred.await(lockAcquired)
        yield* repo.saveSubsequent({
          userId: TEST_USER_ID,
          conversationId: CONVERSATION_ID,
          turnId: '00000000-0000-0000-0000-000000000103',
          userText: 'Good evening',
          assistantText: 'Buenas noches',
          corrections: []
        })

        yield* Fiber.join(t1)

        const messages = yield* sql<{ ordinal: number }>`
          SELECT ordinal FROM message
          WHERE conversation_id = ${CONVERSATION_ID}
          ORDER BY ordinal
        `

        expect(messages.map((m) => m.ordinal)).toEqual([0, 1, 2, 3, 4, 5])
      })
    )
  })
})
