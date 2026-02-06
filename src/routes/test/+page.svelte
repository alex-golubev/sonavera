<script lang="ts">
  import LlmPanel from '$lib/features/llm/components/LlmPanel.svelte'
  import VoiceRecorder from '$lib/features/stt/components/VoiceRecorder.svelte'
  import LanguageSelector from '$lib/features/language/components/LanguageSelector.svelte'
  import LevelSelector from '$lib/features/level/components/LevelSelector.svelte'
</script>

<div class="mx-auto min-h-screen max-w-4xl space-y-10 bg-slate-50 p-8">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">@effect-atom + @effect/platform</h1>
    <div class="flex items-center gap-3">
      <LanguageSelector />
      <LevelSelector />
    </div>
  </div>

  <!-- LLM -->
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-lg font-semibold text-gray-700">Language Tutor</h2>
    <LlmPanel />
  </section>

  <!-- Voice Recorder (STT) -->
  <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-lg font-semibold text-gray-700">Voice Recorder</h2>
    <VoiceRecorder />
  </section>
</div>
