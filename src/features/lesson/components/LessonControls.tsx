'use client'

import { useLocalParticipant } from '@livekit/components-react'

interface LessonControlsProps {
  isTranscriptOpen: boolean
  onToggleTranscriptAction: () => void
  onLeaveAction: () => void
}

export function LessonControls({ isTranscriptOpen, onToggleTranscriptAction, onLeaveAction }: LessonControlsProps) {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant()

  const toggleMic = () => {
    void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
  }

  const btnBase = 'flex h-12 w-12 items-center justify-center rounded-full transition-colors'

  return (
    <div className="flex items-center gap-4 pb-8">
      <button
        type="button"
        className={`${btnBase} ${
          isMicrophoneEnabled
            ? 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
            : 'bg-red-500/15 text-red-500 hover:bg-red-500/25'
        }`}
        onClick={toggleMic}
        aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicrophoneEnabled ? <MicOnIcon /> : <MicOffIcon />}
      </button>

      <button
        type="button"
        className={`${btnBase} ${
          isTranscriptOpen
            ? 'bg-accent/15 text-accent'
            : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
        }`}
        onClick={onToggleTranscriptAction}
        aria-label={isTranscriptOpen ? 'Hide transcript' : 'Show transcript'}
      >
        <span className="text-sm font-semibold">Aa</span>
      </button>

      <button
        type="button"
        onClick={onLeaveAction}
        className={`${btnBase} bg-red-500 text-white hover:bg-red-600`}
        aria-label="Leave lesson"
      >
        <LeaveIcon />
      </button>
    </div>
  )
}

function MicOnIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" />
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="9" y="1" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" />
      <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" />
      <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
    </svg>
  )
}

function LeaveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
