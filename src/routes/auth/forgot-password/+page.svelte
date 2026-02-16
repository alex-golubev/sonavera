<script lang="ts">
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { useCooldown } from '$lib/client/use-cooldown.svelte'
  import { Alert, AuthHeading, FormInput, PrimaryButton } from '$lib/components'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)
  const success = useAtomValue(auth.success)
  const cooldown = useCooldown(success)

  let email = $state('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.requestPasswordReset(registry, email))
  }
</script>

<AuthHeading title="Forgot password?" subtitle="Enter your email and we'll send you a reset link" />

<form onsubmit={handleSubmit} class="space-y-4">
  <FormInput id="email" type="email" label="Email" bind:value={email} placeholder="you@example.com" required />

  {#if error()}
    <Alert variant="error" message={error()} />
  {/if}

  {#if success()}
    <Alert variant="success" message={success()} />
  {/if}

  <PrimaryButton loading={loading()} disabled={cooldown() > 0}>
    {cooldown() > 0 ? `Resend in ${cooldown()}s` : 'Send reset link'}
  </PrimaryButton>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
  Remember your password?
  <a href={resolve('/auth/login')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700">
    Log in
  </a>
</p>
