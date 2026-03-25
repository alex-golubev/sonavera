'use client'

import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { ComponentBoundary } from '~/components/ComponentBoundary'
import { AuraVisualizer } from '~/features/lesson/components/AuraVisualizer'
import { FeedbackToast } from '~/features/lesson/components/FeedbackToast'
import { LessonControls } from '~/features/lesson/components/LessonControls'
import { LessonHeader } from '~/features/lesson/components/LessonHeader'
import { TranscriptionPanel } from '~/features/lesson/components/TranscriptionPanel'

export function LessonRoom({
  token,
  serverUrl,
  onDisconnectedAction,
  onErrorAction
}: {
  token: string
  serverUrl: string
  onDisconnectedAction: () => void
  onErrorAction: (error: Error) => void
}) {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const isLeavingRef = useRef(false)

  const leave = useCallback((callback: () => void) => {
    if (isLeavingRef.current) return
    isLeavingRef.current = true
    setIsLeaving(true)
    setTimeout(callback, 250)
  }, [])

  const handleLeave = useCallback(() => leave(onDisconnectedAction), [leave, onDisconnectedAction])

  const handleDisconnected = useCallback(() => {
    if (isLeavingRef.current) return
    leave(onDisconnectedAction)
  }, [leave, onDisconnectedAction])

  const handleError = useCallback(
    (error: Error) => {
      if (isLeavingRef.current) return
      leave(() => onErrorAction(error))
    },
    [leave, onErrorAction]
  )

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      audio={true}
      video={false}
      onDisconnected={handleDisconnected}
      onError={handleError}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLeaving ? 0 : 1 }}
        transition={{ duration: isLeaving ? 0.25 : 0.4, ease: 'easeOut' }}
        className="relative flex h-screen w-full flex-col overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50"
      >
        <RoomAudioRenderer />

        <div className="absolute top-0 right-0 left-0 z-20">
          <LessonHeader />
        </div>

        <ComponentBoundary
          name="visualization"
          fallback={
            <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">Visualization unavailable</p>
            </div>
          }
        >
          <div className="relative flex h-full w-full flex-1 flex-col">
            <AuraVisualizer />

            <div className="pointer-events-none absolute right-0 bottom-32 left-0 z-10">
              <div className="pointer-events-auto">
                <TranscriptionPanel visible={isTranscriptOpen} />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="relative mx-auto h-full w-full max-w-2xl px-6">
                <FeedbackToast visible={isTranscriptOpen} />
              </div>
            </div>
          </div>
        </ComponentBoundary>

        <ComponentBoundary
          name="controls"
          fallback={
            <div className="absolute right-0 bottom-6 left-0 z-20 flex justify-center pb-8">
              <Link
                href="/"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                aria-label="Leave lesson"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
          }
        >
          <div className="absolute right-0 bottom-8 left-0 z-20 flex justify-center">
            <LessonControls
              isTranscriptOpen={isTranscriptOpen}
              onToggleTranscriptAction={() => setIsTranscriptOpen((prev) => !prev)}
              onLeaveAction={handleLeave}
            />
          </div>
        </ComponentBoundary>
      </motion.div>
    </LiveKitRoom>
  )
}
