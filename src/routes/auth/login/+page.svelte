<script lang="ts">
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)

  let email = $state('')
  let password = $state('')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.signIn(registry, email, password))
  }
</script>

<h1 class="mb-2 text-center text-2xl font-bold text-gray-900">Welcome back</h1>
<p class="mb-6 text-center text-sm text-gray-500">Sign in to continue practicing</p>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
    <input
      id="email"
      type="email"
      required
      bind:value={email}
      placeholder="you@example.com"
      class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
    />
  </div>

  <div>
    <label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
    <input
      id="password"
      type="password"
      required
      bind:value={password}
      placeholder="Enter your password"
      class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
    />
  </div>

  {#if error()}
    <div class="rounded-xl bg-red-50 px-4 py-3">
      <p class="text-sm text-red-700">{error()}</p>
    </div>
  {/if}

  <button
    type="submit"
    disabled={loading()}
    class="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {#if loading()}
      <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    {/if}
    Log in
  </button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
  Don't have an account?
  <a href={resolve('/auth/register')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700">
    Sign up
  </a>
</p>
