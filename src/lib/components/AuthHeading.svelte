<script lang="ts">
  interface Props {
    title: string
    subtitle?: string
  }

  let { title, subtitle }: Props = $props()
</script>

<h1 class="mb-2 text-center text-2xl font-bold text-slate-900">{title}</h1>
{#if subtitle}
  <p class="mb-6 text-center text-sm text-slate-500">{subtitle}</p>
{/if}
