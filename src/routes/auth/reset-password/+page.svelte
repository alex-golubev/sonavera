<script lang="ts">
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { Alert, AuthHeading, FormInput, PrimaryButton } from '$lib/components'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)

  const token = page.url.searchParams.get('token') ?? ''
  const urlError = page.url.searchParams.get('error') ?? ''

  let newPassword = $state('')
  let confirmPassword = $state('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.resetPassword(registry, newPassword, token))
  }
</script>

<AuthHeading title="Set new password" subtitle="Choose a strong password for your account" />

{#if urlError === 'INVALID_TOKEN'}
  <div class="space-y-4">
    <Alert variant="error" message="This reset link has expired or is invalid. Please request a new one." />
    <p class="text-center">
      <a
        href={resolve('/auth/forgot-password')}
        class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm"
      >
        Request new reset link
      </a>
    </p>
  </div>
{:else if !token}
  <div class="space-y-4">
    <Alert variant="error" message="No reset token found. Please request a password reset." />
    <p class="text-center">
      <a
        href={resolve('/auth/forgot-password')}
        class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm"
      >
        Forgot password?
      </a>
    </p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="space-y-4">
    <FormInput
      id="newPassword"
      type="password"
      label="New password"
      bind:value={newPassword}
      placeholder="At least 8 characters"
      required
      minlength={8}
    />

    <FormInput
      id="confirmPassword"
      type="password"
      label="Confirm password"
      bind:value={confirmPassword}
      placeholder="Repeat your password"
      required
      minlength={8}
    />

    {#if confirmPassword && newPassword !== confirmPassword}
      <p class="text-sm text-red-600">Passwords don't match</p>
    {/if}

    {#if error()}
      <Alert variant="error" message={error()} />
    {/if}

    <PrimaryButton loading={loading()} disabled={newPassword !== confirmPassword || newPassword.length < 8}>
      Reset password
    </PrimaryButton>
  </form>
{/if}
