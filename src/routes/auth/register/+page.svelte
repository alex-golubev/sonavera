<script lang="ts">
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'
  import { languages } from '$lib/features/language/schema'
  import { levels } from '$lib/features/level/schema'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)

  let name = $state('')
  let email = $state('')
  let password = $state('')
  let nativeLanguage = $state('en')
  let targetLanguage = $state('es')
  let level = $state('A1')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.signUp(registry, { name, email, password, nativeLanguage, targetLanguage, level }))
  }
</script>

<h1 class="mb-2 text-center text-2xl font-bold text-gray-900">Create your account</h1>
<p class="mb-6 text-center text-sm text-gray-500">Start practicing languages with AI</p>

<form onsubmit={handleSubmit} class="space-y-4">
  <div>
    <label for="name" class="mb-1 block text-sm font-medium text-gray-700">Name</label>
    <input
      id="name"
      type="text"
      required
      bind:value={name}
      placeholder="Your name"
      class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
    />
  </div>

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
      minlength="8"
      bind:value={password}
      placeholder="At least 8 characters"
      class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
    />
  </div>

  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="nativeLanguage" class="mb-1 block text-sm font-medium text-gray-700">I speak</label>
      <select
        id="nativeLanguage"
        bind:value={nativeLanguage}
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
      >
        {#each languages as l (l.code)}
          <option value={l.code}>{l.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="targetLanguage" class="mb-1 block text-sm font-medium text-gray-700">I'm learning</label>
      <select
        id="targetLanguage"
        bind:value={targetLanguage}
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
      >
        {#each languages as l (l.code)}
          <option value={l.code}>{l.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div>
    <label for="level" class="mb-1 block text-sm font-medium text-gray-700">My level</label>
    <select
      id="level"
      bind:value={level}
      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
    >
      {#each levels as l (l.code)}
        <option value={l.code}>{l.name}</option>
      {/each}
    </select>
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
    Create account
  </button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
  Already have an account?
  <a href={resolve('/auth/login')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700">
    Log in
  </a>
</p>
