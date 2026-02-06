import { Atom, Result, type Registry } from '$lib/effect-atom'
import { Effect, Match, pipe } from 'effect'
import { AppClient } from '$lib/rpc/client'
import type { LlmMessage } from './schema'

// --- State atoms ---

export const messages = Atom.make<ReadonlyArray<LlmMessage>>([])
export const responding = Atom.make(false)
export const error = Atom.make('')
export const streamingText = Atom.make('')

// --- Internal ---

const disposeStreamRef = Atom.keepAlive(Atom.make<(() => void) | undefined>(undefined))

const resetStream = (registry: Registry.Registry) => {
  registry.get(disposeStreamRef)?.()
  registry.set(disposeStreamRef, undefined)
}

const finishStream = (registry: Registry.Registry) => {
  const fullText = registry.get(streamingText)
  registry.set(messages, [...registry.get(messages), { role: 'assistant', content: fullText }])
  registry.set(streamingText, '')
  registry.set(responding, false)
  resetStream(registry)
}

const consumeLlm = (registry: Registry.Registry) => {
  resetStream(registry)
  registry.set(streamingText, '')
  registry.set(responding, true)
  registry.set(error, '')

  const atom = AppClient.query('Llm', { messages: [...registry.get(messages)] })
  const unmount = registry.mount(atom)

  const pullOrFinish = (done: boolean) => (done ? finishStream(registry) : registry.set(atom, undefined))

  const unsubscribe = registry.subscribe(atom, () =>
    pipe(
      registry.get(atom),
      Result.matchWithWaiting({
        onWaiting: () => {},
        onSuccess: ({ value: { items, done } }) => {
          registry.set(streamingText, items.map((c) => c.text).join(''))
          pullOrFinish(done)
        },
        onError: (err) => {
          pipe(
            Match.value(err),
            Match.tag('NoSuchElementException', () => {}),
            Match.orElse((e) => registry.set(error, String(e)))
          )
          registry.set(responding, false)
          resetStream(registry)
        },
        onDefect: () => {
          registry.set(error, 'Unknown error')
          registry.set(responding, false)
          resetStream(registry)
        }
      })
    )
  )

  registry.set(disposeStreamRef, () => {
    unsubscribe()
    unmount()
  })
}

// --- Public API ---

export const send = (registry: Registry.Registry, userMessage: string) =>
  Effect.sync(() => {
    registry.set(messages, [...registry.get(messages), { role: 'user', content: userMessage }])
    consumeLlm(registry)
  })

export const reset = (registry: Registry.Registry) =>
  Effect.sync(() => {
    resetStream(registry)
    registry.set(messages, [])
    registry.set(responding, false)
    registry.set(streamingText, '')
    registry.set(error, '')
  })
