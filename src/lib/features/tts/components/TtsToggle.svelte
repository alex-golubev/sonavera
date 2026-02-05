<script lang="ts">
  import { useAtomValue, getRegistry } from '$lib/effect-atom'
  import { Effect } from 'effect'
  import * as tts from '../store'

  const registry = getRegistry()

  const isMuted = useAtomValue(tts.muted)
  const isPlaying = useAtomValue(tts.playing)
  const isLoading = useAtomValue(tts.loading)
</script>

<button
  type="button"
  aria-label={isMuted() ? 'Unmute TTS' : 'Mute TTS'}
  onclick={() => Effect.runSync(tts.toggleMute(registry))}
  class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors
    {isMuted() ? 'text-gray-400 hover:text-gray-600' : 'text-indigo-600 hover:text-indigo-700'}
    hover:bg-gray-100"
>
  {#if isLoading()}
    <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  {:else if isPlaying()}
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.29-3.3A1 1 0 0112.5 6.4v11.2a1 1 0 01-1.71.9L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
      />
    </svg>
  {:else if isMuted()}
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6.5 8.8l4.29-3.3A1 1 0 0112.5 6.4v11.2a1 1 0 01-1.71.9L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5zM17 9.5l5 5m0-5l-5 5"
      />
    </svg>
  {:else}
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.536 8.464a5 5 0 010 7.072M6.5 8.8l4.29-3.3A1 1 0 0112.5 6.4v11.2a1 1 0 01-1.71.9L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
      />
    </svg>
  {/if}
</button>
