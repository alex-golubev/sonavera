<script lang="ts">
  import { resolve } from '$app/paths'
  import { useAtomValue, getRegistry } from '$lib/client/effect-atom'
  import { Alert, AuthHeading, FormInput, LanguagePicker, LevelPicker, PrimaryButton } from '$lib/components'
  import { Effect } from 'effect'
  import * as auth from '$lib/features/auth/store'
  import type { Language } from '$lib/features/language/schema'
  import type { Level } from '$lib/features/level/schema'

  const registry = getRegistry()
  const loading = useAtomValue(auth.loading)
  const error = useAtomValue(auth.error)

  let name = $state('')
  let email = $state('')
  let password = $state('')
  let nativeLanguage = $state<Language>('en')
  let targetLanguage = $state<Language>('es')
  let level = $state<Level>('A1')

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    Effect.runPromise(auth.signUp(registry, { name, email, password, nativeLanguage, targetLanguage, level }))
  }
</script>

<AuthHeading title="Create your account" subtitle="Start practicing languages with AI" />

<form onsubmit={handleSubmit} class="space-y-4">
  <FormInput id="name" label="Name" bind:value={name} placeholder="Your name" required />

  <FormInput id="email" type="email" label="Email" bind:value={email} placeholder="you@example.com" required />

  <FormInput
    id="password"
    type="password"
    label="Password"
    bind:value={password}
    placeholder="At least 8 characters"
    required
    minlength={8}
  />

  <LanguagePicker
    id="nativeLanguage"
    label="I speak"
    bind:value={nativeLanguage}
    disabledLanguages={[targetLanguage]}
  />
  <LanguagePicker
    id="targetLanguage"
    label="I'm learning"
    bind:value={targetLanguage}
    disabledLanguages={[nativeLanguage]}
  />

  <LevelPicker id="level" label="My level" bind:value={level} />

  {#if error()}
    <Alert variant="error" message={error()} />
  {/if}

  <PrimaryButton loading={loading()}>Create account</PrimaryButton>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Already have an account?
  <a href={resolve('/auth/login')} class="font-medium text-fuchsia-600 transition-colors hover:text-fuchsia-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-sm">
    Log in
  </a>
</p>
