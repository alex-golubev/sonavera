<script lang="ts">
  import { languages } from '$lib/features/language/schema'
  import type { Language } from '$lib/features/language/schema'
  import { FormSelect } from '$lib/components'

  interface Props {
    id: string
    label: string
    value: Language
    disabledLanguages?: ReadonlyArray<Language>
  }

  let { id, label, value = $bindable(), disabledLanguages = [] }: Props = $props()

  let options = $derived(
    languages.map((lang) => ({
      value: lang.code,
      label: `${lang.nativeName} (${lang.name})`,
      disabled: disabledLanguages.includes(lang.code)
    }))
  )
</script>

<FormSelect {id} {label} bind:value {options} />
