<script lang="ts">
  interface Props {
    type: 'ai' | 'user'
    size?: 'sm' | 'md'
    online?: boolean
  }

  let { type, size = 'sm', online = false }: Props = $props()
</script>

{#if type === 'ai'}
  {#if size === 'md'}
    <div class="relative">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500"
      >
        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      {#if online}
        <div class="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></div>
      {/if}
    </div>
  {:else}
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100"
    >
      <svg class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    </div>
  {/if}
{:else}
  <div
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-orange-100"
  >
    <span class="text-sm font-medium text-amber-700">Me</span>
  </div>
{/if}
