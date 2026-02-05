<script lang="ts">
  import LlmPanel from '$lib/features/llm/components/LlmPanel.svelte'
  import VoiceRecorder from '$lib/features/stt/components/VoiceRecorder.svelte'
</script>

<div class="mx-auto min-h-screen max-w-4xl space-y-10 bg-slate-50 p-8">
  <h1 class="text-2xl font-bold text-gray-900">@effect-atom + @effect/rpc</h1>

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
