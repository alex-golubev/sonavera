<script lang="ts">
  import { useAtomValue, getRegistry } from '$lib/effect-atom'
  import { Effect, Option, pipe } from 'effect'
  import * as stt from '$lib/features/stt/store'
  import * as llm from '$lib/features/llm/store'
  import * as tts from '$lib/features/tts/store'
  import { language as languageAtom } from '$lib/features/language/store'
  import { level as levelAtom } from '$lib/features/level/store'
  import { languageName } from '$lib/features/language/schema'
  import LanguageSelector from '$lib/features/language/components/LanguageSelector.svelte'
  import LevelSelector from '$lib/features/level/components/LevelSelector.svelte'
  import TtsToggle from '$lib/features/tts/components/TtsToggle.svelte'

  const registry = getRegistry()

  // --- Atoms ---
  const language = useAtomValue(languageAtom)
  const level = useAtomValue(levelAtom)

  const listening = useAtomValue(stt.listening)
  const speaking = useAtomValue(stt.speaking)
  const transcribing = useAtomValue(stt.transcribing)
  const sttText = useAtomValue(stt.text)
  const sttError = useAtomValue(stt.error)
  const initializing = useAtomValue(stt.initializing)

  const messages = useAtomValue(llm.messages)
  const responding = useAtomValue(llm.responding)
  const streamingText = useAtomValue(llm.streamingText)
  const llmError = useAtomValue(llm.error)

  const ttsError = useAtomValue(tts.error)

  // --- Local state ---
  let wasTranscribing = $state(false)
  let wasResponding = $state(false)
  let messagesEl: HTMLDivElement | undefined = $state(undefined)

  // --- Mic handler (user gesture — warmup TTS here for Safari) ---
  const handleMicClick = () => {
    Effect.runSync(tts.warmup(registry))
    Effect.runPromise(stt.toggle(registry, language()))
  }

  // --- STT → LLM bridge ---
  $effect(() => {
    const now = transcribing()
    const justFinished = wasTranscribing && !now
    wasTranscribing = now
    pipe(
      justFinished ? Option.some(undefined) : Option.none(),
      Option.flatMap(() =>
        pipe(
          sttText(),
          Option.liftPredicate((t: string) => t.trim().length > 0)
        )
      ),
      Option.filter(() => !responding()),
      Option.match({
        onNone: () => {},
        onSome: (text) => Effect.runSync(llm.send(registry, text, { language: language(), level: level() }))
      })
    )
  })

  // --- LLM → TTS bridge ---
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

  // --- Auto-scroll ---
  $effect(() => {
    messages()
    streamingText()
    messagesEl?.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' })
  })

  // --- Cleanup ---
  $effect(() => () => {
    Effect.runSync(stt.destroy(registry))
    Effect.runSync(llm.reset(registry))
    Effect.runSync(tts.destroy(registry))
  })
</script>

<div class="flex h-dvh flex-col items-center bg-linear-to-b from-slate-50 to-white p-0 sm:p-4">
  <div
    class="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl sm:shadow-gray-200/50"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500"
          >
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div
            class="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"
          ></div>
        </div>
        <div>
          <p class="font-semibold text-gray-900">Emma</p>
          <p class="text-sm text-gray-500">AI Tutor · {languageName(language())}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <LanguageSelector />
        <LevelSelector />
        <TtsToggle />
      </div>
    </div>

    <!-- Messages -->
    <div bind:this={messagesEl} class="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      {#each messages() as msg, i (i)}
        {#if msg.role === 'assistant'}
          <div class="flex gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100"
            >
              <svg
                class="h-4 w-4 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div class="max-w-[75%]">
              <div class="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                <p dir="auto" class="text-sm text-gray-700">{msg.content}</p>
              </div>
            </div>
          </div>
        {:else}
          <div class="flex justify-end gap-3">
            <div class="max-w-[75%]">
              <div class="rounded-2xl rounded-tr-none bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3">
                <p dir="auto" class="text-sm text-white">{msg.content}</p>
              </div>
            </div>
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-orange-100"
            >
              <span class="text-sm font-medium text-amber-700">Me</span>
            </div>
          </div>
        {/if}
      {/each}

      {#if streamingText()}
        <div class="flex gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100"
          >
            <svg class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div class="max-w-[75%]">
            <div class="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
              <p dir="auto" class="text-sm text-gray-700">
                {streamingText()}<span class="ml-0.5 inline-block h-4 w-1 animate-pulse bg-gray-400"></span>
              </p>
            </div>
          </div>
        </div>
      {/if}

      {#if llmError()}
        <div class="rounded-xl bg-red-50 px-4 py-3">
          <p class="text-sm text-red-700">{llmError()}</p>
        </div>
      {/if}
      {#if sttError()}
        <div class="rounded-xl bg-red-50 px-4 py-3">
          <p class="text-sm text-red-700">{sttError()}</p>
        </div>
      {/if}
      {#if ttsError()}
        <div class="rounded-xl bg-red-50 px-4 py-3">
          <p class="text-sm text-red-700">{ttsError()}</p>
        </div>
      {/if}
    </div>

    <!-- Voice Input -->
    <div class="border-t border-gray-100 bg-linear-to-t from-gray-50 to-white px-6 py-5">
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          {#if listening() && speaking()}
            <div class="absolute inset-0 animate-ping rounded-full bg-fuchsia-400 opacity-20"></div>
            <div
              class="absolute -inset-2 animate-pulse rounded-full bg-linear-to-r from-indigo-500/20 to-fuchsia-500/20 blur-md"
            ></div>
          {/if}
          <button
            type="button"
            aria-label={listening() ? 'Stop listening' : 'Start listening'}
            disabled={Boolean(initializing())}
            onclick={handleMicClick}
            class="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full transition-all duration-200
              {listening()
              ? 'bg-linear-to-r from-red-500 to-fuchsia-600 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
              : 'bg-linear-to-r from-indigo-600 to-fuchsia-600 shadow-lg shadow-fuchsia-500/30 hover:shadow-xl hover:shadow-fuchsia-500/40'}
              text-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {#if listening()}
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            {:else}
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            {/if}
          </button>
        </div>
        <p class="text-sm text-gray-500">
          {#if initializing()}
            Loading...
          {:else if transcribing()}
            Transcribing...
          {:else if speaking()}
            Listening...
          {:else if responding()}
            Emma is typing...
          {:else if listening()}
            Speak now
          {:else}
            Tap to speak
          {/if}
        </p>
      </div>
    </div>
  </div>
</div>
