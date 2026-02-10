<script lang="ts">
  import { useAtomValue, getRegistry } from '$lib/effect-atom'
  import { Effect } from 'effect'
  import * as stt from '../store'

  const registry = getRegistry()

  const listening = useAtomValue(stt.listening)
  const speaking = useAtomValue(stt.speaking)
  const transcribing = useAtomValue(stt.transcribing)
  const text = useAtomValue(stt.text)
  const error = useAtomValue(stt.error)
  const initializing = useAtomValue(stt.initializing)

  $effect(() => () => Effect.runSync(stt.destroy(registry)))
</script>

<div class="flex flex-col items-center gap-4">
  <div class="relative">
    {#if listening() && speaking()}
      <div class="absolute -inset-2 animate-pulse rounded-full bg-fuchsia-400/30 blur-md"></div>
    {/if}
    <button
      type="button"
      aria-label={listening() ? 'Stop listening' : 'Start listening'}
      disabled={Boolean(initializing())}
      onclick={() => Effect.runPromise(stt.toggle(registry))}
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
    {:else if speaking()}
      Listening...
    {:else if transcribing()}
      Transcribing...
    {:else if listening()}
      Speak now
    {:else}
      Tap to speak
    {/if}
  </p>

  {#if text()}
    <div class="w-full max-w-md rounded-xl bg-gray-100 px-4 py-3">
      <p dir="auto" class="text-sm text-gray-700">{text()}</p>
    </div>
  {/if}

  {#if error()}
    <div class="w-full max-w-md rounded-xl bg-red-50 px-4 py-3">
      <p class="text-sm text-red-700">{error()}</p>
    </div>
  {/if}
</div>
