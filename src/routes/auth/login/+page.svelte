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

  const resetSuccess = page.url.searchParams.get('reset') === 'success'

  let email = $state('')
  let password = $state('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.signIn(registry, email, password))
  }
</script>

<AuthHeading title="Welcome back" subtitle="Sign in to continue practicing" />

{#if resetSuccess}
  <div class="mb-4">
    <Alert variant="success" message="Password reset successfully. You can now log in with your new password." />
  </div>
{/if}

<form onsubmit={handleSubmit} class="space-y-4">
  <FormInput
    id="email"
    type="email"
    label="Email"
    bind:value={email}
    placeholder="you@example.com"
    required
    disabled={loading()}
    autofocus
  />

  {#snippet forgotLink()}
    <a
      href={resolve('/auth/forgot-password')}
      class="rounded-sm text-sm font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      Forgot password?
    </a>
  {/snippet}
  <FormInput
    id="password"
    type="password"
    label="Password"
    bind:value={password}
    placeholder="Enter your password"
    required
    disabled={loading()}
    labelAction={forgotLink}
  />

  {#if error()}
    <Alert variant="error" message={error()} />
  {/if}

  <PrimaryButton loading={loading()}>Log in</PrimaryButton>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Don't have an account?
  <a
    href={resolve('/auth/register')}
    class="rounded-sm font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
  >
    Sign up
  </a>
</p>
