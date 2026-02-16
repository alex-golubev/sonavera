<script lang="ts">
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { Alert, Avatar, IconButton, MessageBubble } from '$lib/components'
  import { Effect } from 'effect'
  import { page } from '$app/state'
  import * as auth from '$lib/features/auth/store'
  import * as conversation from '$lib/features/conversation/store'
  import { DEFAULT_TARGET_LANGUAGE, languageName, type Language } from '$lib/features/language/schema'

  const registry = getRegistry()

  const handleSignOut = () => Effect.runPromise(auth.signOut(registry))

  // --- User settings from server ---
  const targetLanguage = (): Language => (page.data.user?.targetLanguage ?? DEFAULT_TARGET_LANGUAGE) as Language

  // --- Atoms ---
  const listening = useAtomValue(conversation.listening)
  const speaking = useAtomValue(conversation.speaking)
  const initializing = useAtomValue(conversation.initializing)
  const currentPhase = useAtomValue(conversation.phase)
  const msgs = useAtomValue(conversation.messages)
  const streaming = useAtomValue(conversation.streamingText)
  const isMuted = useAtomValue(conversation.muted)
  const currentError = useAtomValue(conversation.error)

  // --- Local state ---
  let messagesEl: HTMLDivElement | undefined = $state(undefined)

  // --- Mic handler (user gesture — warmup TTS here for Safari) ---
  const handleMicClick = () => {
    conversation.warmup(registry)
    conversation.toggle(registry)
  }

  // --- Mute handler ---
  const handleMuteToggle = () => {
    Effect.runSync(conversation.toggleMute(registry))
  }

  // --- Auto-scroll ---
  $effect(() => {
    msgs()
    streaming()
    messagesEl?.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' })
  })

  // --- Cleanup ---
  $effect(() => () => {
    Effect.runSync(conversation.destroy(registry))
  })
</script>

<div class="flex h-dvh flex-col items-center bg-linear-to-b from-slate-50 to-white p-0 sm:p-4">
  <div
    class="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl sm:shadow-gray-200/50"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center gap-3">
        <Avatar type="ai" size="md" online />
        <div>
          <p class="font-semibold text-gray-900">Emma</p>
          <p class="text-sm text-gray-500">AI Tutor · {languageName(targetLanguage())}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- TTS Mute Toggle -->
        <IconButton label={isMuted() ? 'Unmute' : 'Mute'} onclick={handleMuteToggle}>
          {#if currentPhase() === 'speaking'}
            <svg class="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l5.7-4.2c.6-.4 1.3 0 1.3.7v13.4c0 .7-.7 1.1-1.3.7L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
              />
            </svg>
          {:else if isMuted()}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.5 8.8l5.7-4.2c.6-.4 1.3 0 1.3.7v13.4c0 .7-.7 1.1-1.3.7L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5zM17 9.5l5 5m0-5l-5 5"
              />
            </svg>
          {:else}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M6.5 8.8l5.7-4.2c.6-.4 1.3 0 1.3.7v13.4c0 .7-.7 1.1-1.3.7L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z"
              />
            </svg>
          {/if}
        </IconButton>

        <IconButton label="Sign out" onclick={handleSignOut}>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </IconButton>
      </div>
    </div>

    <!-- Messages -->
    <div bind:this={messagesEl} class="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      {#each msgs() as msg, i (i)}
        {#if msg.role === 'assistant'}
          <div class="flex gap-3">
            <Avatar type="ai" />
            <div class="max-w-[75%]">
              <MessageBubble role="assistant" content={msg.content} />
            </div>
          </div>
        {:else}
          <div class="flex justify-end gap-3">
            <div class="max-w-[75%]">
              <MessageBubble role="user" content={msg.content} />
            </div>
            <Avatar type="user" />
          </div>
        {/if}
      {/each}

      {#if streaming()}
        <div class="flex gap-3">
          <Avatar type="ai" />
          <div class="max-w-[75%]">
            <MessageBubble role="assistant">
              <p dir="auto" class="text-sm text-gray-700">
                {streaming()}<span class="ml-0.5 inline-block h-4 w-1 animate-pulse bg-gray-400"></span>
              </p>
            </MessageBubble>
          </div>
        </div>
      {/if}

      {#if currentError()}
        <Alert variant="error" message={currentError()} />
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
          {:else if currentPhase() === 'transcribing'}
            Transcribing...
          {:else if speaking()}
            Listening...
          {:else if currentPhase() === 'responding'}
            Emma is typing...
          {:else if currentPhase() === 'speaking'}
            Emma is speaking...
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
