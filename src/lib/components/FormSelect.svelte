<script lang="ts" generics="T extends string">
  interface Props {
    id: string
    label: string
    value: T
    options: ReadonlyArray<{ readonly value: T; readonly label: string; readonly disabled?: boolean }>
  }

  let { id, label, value = $bindable(), options }: Props = $props()
</script>

<div>
  <label for={id} class="mb-1 block text-sm font-medium text-slate-700">{label}</label>
  <select
    {id}
    bind:value
    class="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset"
  >
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>{option.label}</option>
    {/each}
  </select>
</div>
