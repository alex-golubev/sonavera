'use client'

import { useLocalParticipant, useTrackVolume, useVoiceAssistant } from '@livekit/components-react'
import { motion } from 'framer-motion'
import type { LocalAudioTrack } from 'livekit-client'
import type { CSSProperties } from 'react'
import { cn } from '~/lib/utils'

const stateLabels: Record<string, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  listening: 'Listening',
  thinking: 'Thinking...',
  speaking: 'Speaking'
}

const safariBlurFix: CSSProperties = {
  willChange: 'transform',
  transform: 'translateZ(0)',
  WebkitBackfaceVisibility: 'hidden'
}

export function AuraVisualizer() {
  const { state, audioTrack } = useVoiceAssistant()
  const { microphoneTrack } = useLocalParticipant()

  const agentVolume = useTrackVolume(audioTrack)
  const userVolume = useTrackVolume(microphoneTrack?.track as LocalAudioTrack | undefined)

  const isAgentActive = agentVolume > 0.03
  const isUserActive = userVolume > 0.03

  const targetVol = isAgentActive && agentVolume >= userVolume ? agentVolume : isUserActive ? userVolume : 0

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
      <p className="mb-8 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
        {stateLabels[state] ?? state}
      </p>

      <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
        <motion.div
          animate={{
            scale: 1 + targetVol * 1.5,
            opacity: targetVol > 0.05 ? 0.8 : 0.3
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className={cn(
            'absolute -inset-16 rounded-full blur-3xl transition-colors duration-500',
            isAgentActive && agentVolume >= userVolume
              ? 'bg-teal-500/40'
              : isUserActive
                ? 'bg-indigo-500/40'
                : 'bg-zinc-500/20'
          )}
          style={safariBlurFix}
        />

        <motion.div
          animate={{
            scale: 1 + targetVol * 2.2,
            opacity: targetVol > 0.05 ? 0.5 : 0.1
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.5 }}
          className={cn(
            'absolute -inset-16 rounded-full blur-3xl transition-colors duration-700',
            isAgentActive && agentVolume >= userVolume
              ? 'bg-teal-400/30'
              : isUserActive
                ? 'bg-indigo-400/30'
                : 'bg-zinc-400/10'
          )}
          style={safariBlurFix}
        />

        <motion.div
          animate={{
            scale: 1 + targetVol * 0.5,
            opacity: targetVol > 0.05 ? 1 : 0.5
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={cn(
            'absolute h-32 w-32 rounded-full blur-xl transition-colors duration-300',
            isAgentActive && agentVolume >= userVolume
              ? 'bg-teal-300/60'
              : isUserActive
                ? 'bg-indigo-300/60'
                : 'bg-zinc-300/30'
          )}
          style={safariBlurFix}
        />
      </div>
    </div>
  )
}
