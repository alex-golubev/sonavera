<script lang="ts">
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { useCooldown } from '$lib/client/use-cooldown.svelte'
  import { Alert, PrimaryButton } from '$lib/components'
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

  <h1 class="mb-2 text-2xl font-bold text-slate-900">Check your email</h1>
  <p class="mb-6 text-sm text-slate-500">
    We sent a verification link to
    {#if email}
      <span class="font-medium text-slate-700">{email}</span>
    {:else}
      your email address
    {/if}
  </p>

  {#if error()}
    <div class="mb-4">
      <Alert variant="error" message={error()} />
    </div>
  {/if}

  {#if success()}
    <div class="mb-4">
      <Alert variant="success" message={success()} />
    </div>
  {/if}

  {#if email}
    <PrimaryButton type="button" loading={loading()} disabled={cooldown() > 0} onclick={handleResend}>
      {cooldown() > 0 ? `Resend in ${cooldown()}s` : 'Resend verification email'}
    </PrimaryButton>
  {/if}
</div>

<p class="mt-6 text-center text-sm text-slate-500">
  <a href={resolve('/auth/login')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm">
    Back to login
  </a>
</p>
