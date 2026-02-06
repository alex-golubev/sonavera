import type { Registry } from '$lib/effect-atom'
import { Effect } from 'effect'
import * as llm from '$lib/features/llm/store'
import * as stt from '$lib/features/stt/store'

// Language affects both LLM prompt and STT (VAD has language baked into closure)
export const onLanguageChange = (registry: Registry.Registry) =>
  Effect.all([llm.reset(registry), stt.destroy(registry)])

// Level only affects LLM system prompt — STT is language-only
export const onLevelChange = (registry: Registry.Registry) => llm.reset(registry)
