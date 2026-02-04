<script lang="ts">
  import { useAtom, useAtomValue } from '$lib/effect-atom'
  import { counterAtom, doubledAtom } from '$lib/stores/counter'

  const counter = useAtom(counterAtom)
  const doubled = useAtomValue(doubledAtom)
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 p-8">
  <h1 class="text-2xl font-bold text-gray-900">@effect-atom Svelte Adapter Test</h1>

  <div class="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
    <div class="mb-6 text-center">
      <p class="text-sm text-gray-500">Counter value</p>
      <p class="text-5xl font-bold text-indigo-600">{counter.value()}</p>
    </div>

    <div class="mb-6 text-center">
      <p class="text-sm text-gray-500">Doubled (derived atom)</p>
      <p class="text-3xl font-semibold text-fuchsia-600">{doubled()}</p>
    </div>

    <div class="flex gap-3">
      <button
        onclick={() => counter.set(counter.value() - 1)}
        class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
      >
        -1
      </button>
      <button
        onclick={() => counter.set(0)}
        class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
      >
        Reset
      </button>
      <button
        onclick={() => counter.set(counter.value() + 1)}
        class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
      >
        +1
      </button>
    </div>
  </div>

  <p class="text-sm text-gray-400">Open DevTools to verify no errors. Try clicking buttons to test reactivity.</p>
</div>
