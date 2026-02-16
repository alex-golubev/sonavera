<script lang="ts">
  interface Props {
    id: string
    label: string
    value: string
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>
  }

  let { id, label, value = $bindable(), options }: Props = $props()
</script>

<div>
  <label for={id} class="mb-1 block text-sm font-medium text-gray-700">{label}</label>
  <select
    {id}
    bind:value
    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none"
  >
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
