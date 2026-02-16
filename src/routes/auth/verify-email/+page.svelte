<script lang="ts">
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { useCooldown } from '$lib/client/use-cooldown.svelte'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)
  const success = useAtomValue(auth.success)
  const cooldown = useCooldown(success)

  const email = page.url.searchParams.get('email') ?? ''

  const handleResend = () => {
    Effect.runPromise(auth.resendVerificationEmail(registry, email))
  }
</script>

<div class="text-center">
  <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
    <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  </div>

  <h1 class="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
  <p class="mb-6 text-sm text-gray-500">
    We sent a verification link to
    {#if email}
      <span class="font-medium text-gray-700">{email}</span>
    {:else}
      your email address
    {/if}
  </p>

  {#if error()}
    <div class="mb-4 rounded-xl bg-red-50 px-4 py-3">
      <p class="text-sm text-red-700">{error()}</p>
    </div>
  {/if}

  {#if success()}
    <div class="mb-4 rounded-xl bg-green-50 px-4 py-3">
      <p class="text-sm text-green-700">{success()}</p>
    </div>
  {/if}

  {#if email}
    <button
      onclick={handleResend}
      disabled={loading() || cooldown() > 0}
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#if loading()}
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      {/if}
      {cooldown() > 0 ? `Resend in ${cooldown()}s` : 'Resend verification email'}
    </button>
  {/if}
</div>

<p class="mt-6 text-center text-sm text-gray-500">
  <a href={resolve('/auth/login')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700">
    Back to login
  </a>
</p>
