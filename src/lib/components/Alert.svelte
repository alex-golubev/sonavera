<script lang="ts">
  interface Props {
    variant: 'error' | 'success'
    message: string
  }

  const styles: Record<string, { bg: string; text: string }> = {
    error: { bg: 'bg-red-50', text: 'text-red-700' },
    success: { bg: 'bg-green-50', text: 'text-green-700' }
  }

  let { variant, message }: Props = $props()
</script>

<div class="rounded-xl {styles[variant].bg} px-4 py-3">
  <p class="text-sm {styles[variant].text}">{message}</p>
</div>
