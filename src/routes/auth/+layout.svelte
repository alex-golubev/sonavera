<script lang="ts">
  import { resolve } from '$app/paths'

  let { children } = $props()
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-linear-to-b from-slate-50 to-white px-4 py-8">
  <!-- Background decoration -->
  <div class="pointer-events-none fixed inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-fuchsia-200/50 blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl"></div>
  </div>

  <!-- Logo -->
  <a href={resolve('/')} class="relative mb-8 flex items-center gap-2.5">
    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500">
      <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </div>
    <span class="text-lg font-semibold text-gray-900">Sonavera</span>
  </a>

  <!-- Card -->
  <div class="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl shadow-gray-200/50">
    {@render children()}
  </div>
</div>
