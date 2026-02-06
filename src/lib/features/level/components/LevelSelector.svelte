<script lang="ts">
  import { useAtom, getRegistry } from '$lib/effect-atom'
  import { Effect, Schema } from 'effect'
  import * as llm from '$lib/features/llm/store'
  import * as stt from '$lib/features/stt/store'
  import { Level, levels } from '../schema'
  import { level as levelAtom } from '../store'

  const registry = getRegistry()
  const { value: lvl, set: setLvl } = useAtom(levelAtom)
  const decodeLevel = Schema.decodeUnknownSync(Level)

  const handleChange = (e: Event) => {
    const value = decodeLevel((e.target as HTMLSelectElement).value)
    setLvl(value)
    Effect.runSync(llm.reset(registry))
    Effect.runSync(stt.destroy(registry))
  }
</script>

<select
  onchange={handleChange}
  class="shrink-0 rounded-lg border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
>
  {#each levels as l (l.code)}
    <option value={l.code} selected={l.code === lvl()}>{l.name}</option>
  {/each}
</select>
