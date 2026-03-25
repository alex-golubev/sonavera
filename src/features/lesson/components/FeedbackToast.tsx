'use client'

import { useDataChannel } from '@livekit/components-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface FeedbackData {
  grammar: number
  vocabulary: number
  fluency: number
  feedback: string
  correction?: string
}

interface TimestampedFeedback extends FeedbackData {
  ts: number
}

const scoreLabel = (key: string) => (key === 'grammar' ? 'Grammar' : key === 'vocabulary' ? 'Vocabulary' : 'Fluency')

const scoreColor = (value: number) =>
  value >= 4
    ? 'bg-emerald-400 dark:bg-emerald-500'
    : value >= 3
      ? 'bg-amber-400 dark:bg-amber-500'
      : 'bg-red-400 dark:bg-red-500'

export function FeedbackToast({ visible }: { visible: boolean }) {
  const [current, setCurrent] = useState<TimestampedFeedback | null>(null)

  useDataChannel('feedback', (msg) => {
    const { data } = JSON.parse(new TextDecoder().decode(msg.payload)) as { data: FeedbackData }
    setCurrent({ ...data, ts: Date.now() })
  })

  return (
    <AnimatePresence mode="wait">
      {visible && current && (
        <motion.div
          key={current.ts}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: '-28vh' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto absolute right-0 bottom-32 w-80 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-[0_8px_20px_rgba(0,0,0,0.04),0_20px_50px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/5 dark:bg-neutral-900/60 dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
        >
          {/* Score bars */}
          <div className="mb-3 flex items-center gap-3">
            {(['grammar', 'vocabulary', 'fluency'] as const).map((key) => (
              <div key={key} className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                    {scoreLabel(key)}
                  </span>
                  <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">{current[key]}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <motion.div
                    className={`h-full rounded-full ${scoreColor(current[key])}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(current[key] / 5) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Feedback text */}
          <p className="text-[13px] font-medium leading-relaxed text-neutral-600 dark:text-neutral-300">
            {current.feedback}
          </p>

          {/* Correction */}
          {current.correction && (
            <div className="mt-2.5 rounded-xl bg-emerald-50/80 px-3 py-2 dark:bg-emerald-900/20">
              <p className="text-[12px] font-medium text-emerald-700 dark:text-emerald-400">{current.correction}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
