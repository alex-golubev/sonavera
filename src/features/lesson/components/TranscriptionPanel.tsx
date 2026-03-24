'use client'

import { useTranscriptions, useVoiceAssistant } from '@livekit/components-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { cn } from '~/lib/utils'

interface TranscriptEntry {
  readonly id: string
  readonly speaker: string
  readonly text: string
  readonly isUser: boolean
  readonly timestamp: number
}

export function TranscriptionPanel({ visible }: { visible: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { agent } = useVoiceAssistant()
  const transcriptions = useTranscriptions()

  const agentIdentity = agent?.identity

  const entries: TranscriptEntry[] = useMemo(
    () =>
      transcriptions
        .filter((t) => t.text.trim() !== '')
        .map((t) => {
          const isUser = t.participantInfo.identity !== agentIdentity
          return {
            id: t.streamInfo.id,
            speaker: isUser ? 'You' : 'Emma',
            text: t.text,
            isUser,
            timestamp: t.streamInfo.timestamp
          }
        })
        .sort((a, b) => a.timestamp - b.timestamp),
    [transcriptions, agentIdentity]
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new entries
  useEffect(() => {
    if (visible) {
      const el = scrollRef.current
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [entries.length, visible])

  if (!visible) return null

  return (
    <div
      className="relative mx-auto flex w-full max-w-2xl flex-col"
      style={{
        height: '40vh',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 100%)'
      }}
    >
      <div
        ref={scrollRef}
        className="hide-scrollbar relative z-0 flex flex-1 flex-col overflow-y-auto scroll-smooth px-6"
      >
        <div className="mt-auto flex w-full flex-col gap-4 pt-12 pb-6">
          {entries.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto text-center text-sm tracking-wide text-zinc-400 dark:text-zinc-500"
            >
              Transcript will appear here...
            </motion.p>
          ) : (
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => {
                const isLatest = index === entries.length - 1

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{
                      opacity: isLatest ? 1 : 0.6,
                      y: 0,
                      filter: 'blur(0px)',
                      scale: isLatest ? 1 : 0.98
                    }}
                    transition={{
                      opacity: { duration: 0.4 },
                      y: { type: 'spring', bounce: 0, duration: 0.5 },
                      filter: { duration: 0.3 }
                    }}
                    className={cn(
                      'flex w-full max-w-[85%] flex-col',
                      entry.isUser ? 'items-end self-end text-right' : 'items-start self-start text-left'
                    )}
                  >
                    <span
                      className={cn(
                        'mb-1.5 text-[10px] font-medium tracking-[0.2em] uppercase drop-shadow-sm',
                        entry.isUser
                          ? 'text-indigo-600/70 dark:text-indigo-500/70'
                          : 'text-teal-600/70 dark:text-teal-500/70'
                      )}
                    >
                      {entry.speaker}
                    </span>
                    <p
                      className={cn(
                        'text-[17px] leading-relaxed font-normal tracking-wide drop-shadow-md sm:text-lg',
                        entry.isUser ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'
                      )}
                    >
                      {entry.text}
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
