<script lang="ts">
  import { getRegistry } from '$lib/client/effect-atom'
  import ConversationView from '$lib/features/conversation/client/components/ConversationView.svelte'
  import * as conversation from '$lib/features/conversation/client/store'

  const { data } = $props()
  const registry = getRegistry()

  $effect(() => {
    conversation.hydrate(registry, data)
  })
</script>

<ConversationView />
