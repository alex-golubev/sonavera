<script lang="ts">
  import { page } from '$app/state'
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
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

<h1 class="mb-2 text-center text-2xl font-bold text-gray-900">Set new password</h1>
<p class="mb-6 text-center text-sm text-gray-500">Choose a strong password for your account</p>

{#if urlError === 'INVALID_TOKEN'}
  <div class="space-y-4">
    <div class="rounded-xl bg-red-50 px-4 py-3">
      <p class="text-sm text-red-700">This reset link has expired or is invalid. Please request a new one.</p>
    </div>
    <p class="text-center">
      <a
        href={resolve('/auth/forgot-password')}
        class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700"
      >
        Request new reset link
      </a>
    </p>
  </div>
{:else if !token}
  <div class="space-y-4">
    <div class="rounded-xl bg-red-50 px-4 py-3">
      <p class="text-sm text-red-700">No reset token found. Please request a password reset.</p>
    </div>
    <p class="text-center">
      <a
        href={resolve('/auth/forgot-password')}
        class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700"
      >
        Forgot password?
      </a>
    </p>
  </div>
{:else}
  <form onsubmit={handleSubmit} class="space-y-4">
    <div>
      <label for="newPassword" class="mb-1 block text-sm font-medium text-gray-700">New password</label>
      <input
        id="newPassword"
        type="password"
        required
        minlength="8"
        bind:value={newPassword}
        placeholder="At least 8 characters"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
      />
    </div>

    <div>
      <label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
      <input
        id="confirmPassword"
        type="password"
        required
        minlength="8"
        bind:value={confirmPassword}
        placeholder="Repeat your password"
        class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
      />
    </div>

    {#if confirmPassword && newPassword !== confirmPassword}
      <p class="text-sm text-red-600">Passwords don't match</p>
    {/if}

    {#if error()}
      <div class="rounded-xl bg-red-50 px-4 py-3">
        <p class="text-sm text-red-700">{error()}</p>
      </div>
    {/if}

    <button
      type="submit"
      disabled={loading() || newPassword !== confirmPassword || newPassword.length < 8}
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#if loading()}
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      {/if}
      Reset password
    </button>
  </form>
{/if}
