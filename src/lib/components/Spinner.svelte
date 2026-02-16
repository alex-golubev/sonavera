<script lang="ts">
  interface Props {
    size?: 'sm' | 'md'
  }

  const sizeClass: Record<string, string> = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  }

  let { size = 'sm' }: Props = $props()
</script>

<svg class="{sizeClass[size]} animate-spin" viewBox="0 0 24 24" fill="none">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
</svg>
