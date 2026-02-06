<script lang="ts">
  import { useAtomValue, getRegistry } from '$lib/effect-atom'
  import { Effect, Option, pipe } from 'effect'
  import * as llm from '../store'
  import * as tts from '$lib/features/tts/store'
  import { language as languageAtom } from '$lib/features/language/store'
  import { level as levelAtom } from '$lib/features/level/store'
  import TtsToggle from '$lib/features/tts/components/TtsToggle.svelte'

  const registry = getRegistry()

  const language = useAtomValue(languageAtom)
  const level = useAtomValue(levelAtom)
  const messages = useAtomValue(llm.messages)
  const responding = useAtomValue(llm.responding)
  const streamingText = useAtomValue(llm.streamingText)
  const error = useAtomValue(llm.error)
  const ttsError = useAtomValue(tts.error)

  let input = $state('')
  let wasResponding = $state(false)

  const handleSend = () => {
    const trimmed = input.trim()
    input = ''
    Effect.runSync(tts.warmup(registry))
    Effect.runSync(llm.send(registry, trimmed, language(), level()))
  }

  const handleKeydown = (e: KeyboardEvent) =>
    e.key === 'Enter' && !e.shiftKey && input.trim()
      ? (() => {
          e.preventDefault()
          handleSend()
        })()
      : undefined

  $effect(() => {
    const now = responding()
    const justFinished = wasResponding && !now
    wasResponding = now
    pipe(
      justFinished ? Option.some(undefined) : Option.none(),
      Option.flatMap(() =>
        pipe(
          messages().at(-1),
          Option.fromNullable,
          Option.filter((msg) => msg.role === 'assistant')
        )
      ),
      Option.match({
        onNone: () => {},
        onSome: (msg) => Effect.runSync(tts.speak(registry, msg.content, 'coral'))
      })
    )
  })

  $effect(() => () => {
    Effect.runSync(llm.reset(registry))
    Effect.runSync(tts.destroy(registry))
  })
</script>

<div class="flex h-125 flex-col rounded-xl border border-gray-200 bg-white">
  <div class="flex-1 space-y-3 overflow-y-auto p-4">
    {#each messages() as msg, i (i)}
      <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div
          class="max-w-[75%] rounded-2xl px-4 py-2 text-sm
            {msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}"
        >
          <span dir="auto">{msg.content}</span>
        </div>
      </div>
    {/each}

    {#if streamingText()}
      <div class="flex justify-start">
        <div dir="auto" class="max-w-[75%] rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-800">
          {streamingText()}
          <span class="inline-block h-4 w-1 animate-pulse bg-gray-400"></span>
        </div>
      </div>
    {/if}

    {#if error()}
      <div class="rounded-xl bg-red-50 px-4 py-3">
        <p class="text-sm text-red-700">{error()}</p>
      </div>
    {/if}

    {#if ttsError()}
      <div class="rounded-xl bg-red-50 px-4 py-3">
        <p class="text-sm text-red-700">{ttsError()}</p>
      </div>
    {/if}
  </div>

  <div class="border-t border-gray-200 p-3">
    <div class="flex gap-2">
      <input
        dir="auto"
        type="text"
        bind:value={input}
        onkeydown={handleKeydown}
        disabled={responding()}
        placeholder="Type a message..."
        class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
      />
      <TtsToggle />
      <button
        type="button"
        onclick={handleSend}
        disabled={responding() || !input.trim()}
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  </div>
</div>
