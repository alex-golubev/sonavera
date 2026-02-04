<script lang="ts">
  import { useAtom, useAtomValue, useAtomResult } from '$lib/effect-atom'
  import { counterAtom, doubledAtom } from '$lib/stores/counter'
  import { pingAtom } from '$lib/stores/languages'

  const counter = useAtom(counterAtom)
  const doubled = useAtomValue(doubledAtom)
  const ping = useAtomResult(pingAtom)
</script>

<div class="mx-auto min-h-screen max-w-4xl space-y-10 bg-slate-50 p-8">
  <h1 class="text-2xl font-bold text-gray-900">@effect-atom + @effect/rpc</h1>

  <!-- Counter (local atoms) -->
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-lg font-semibold text-gray-700">Counter</h2>
    <div class="flex items-center gap-6">
      <p class="text-4xl font-bold text-indigo-600">{counter.value()}</p>
      <p class="text-2xl font-semibold text-fuchsia-600">x2 = {doubled()}</p>
      <div class="flex gap-2">
        <button
          onclick={() => counter.set(counter.value() - 1)}
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          -1
        </button>
        <button
          onclick={() => counter.set(0)}
          class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Reset
        </button>
        <button
          onclick={() => counter.set(counter.value() + 1)}
          class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          +1
        </button>
      </div>
    </div>
  </section>

  <!-- RPC Ping -->
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-lg font-semibold text-gray-700">RPC Ping</h2>
    {#if ping.isLoading() && !ping.isSuccess()}
      <p class="text-gray-500">Pinging...</p>
    {:else if ping.isSuccess()}
      <p class="text-green-600">ok: {ping.value()?.ok}</p>
    {:else if ping.isFailure()}
      <p class="text-red-600">Error: {ping.error()}</p>
    {/if}
  </section>
</div>
