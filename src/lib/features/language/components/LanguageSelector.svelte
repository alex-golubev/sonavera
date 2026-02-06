<script lang="ts">
  import { useAtom, getRegistry } from '$lib/effect-atom'
  import { Effect } from 'effect'
  import * as llm from '$lib/features/llm/store'
  import * as stt from '$lib/features/stt/store'
  import { languages, type Language } from '../schema'
  import { language as languageAtom } from '../store'

  const registry = getRegistry()
  const { value: lang, set: setLang } = useAtom(languageAtom)

  const handleChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value as Language
    setLang(value)
    Effect.runSync(llm.reset(registry))
    Effect.runSync(stt.destroy(registry))
  }
</script>

<select
  value={lang()}
  onchange={handleChange}
  class="shrink-0 rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
>
  {#each languages as l (l.code)}
    <option value={l.code}>{l.nativeName}</option>
  {/each}
</select>
