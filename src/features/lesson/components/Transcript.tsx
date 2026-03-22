import { type ReceivedMessage, useAgent } from '@livekit/components-react'
import { Match } from 'effect'
import { useTranscript } from '../hooks/useTranscript'

function TranscriptMessage({ message }: { message: ReceivedMessage }) {
  if (!('message' in message) || !message.message?.trim()) return null

  const isUser = message.type === 'userTranscript'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <p
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser ? 'bg-foreground text-background' : 'bg-foreground/10 text-foreground'
        }`}
      >
        {message.message}
      </p>
    </div>
  )
}

function AgentIndicator() {
  const { state } = useAgent()
  return (
    <p className="px-1 font-mono text-sm text-foreground/60">
      {Match.value(state).pipe(
        Match.when('listening', () => 'Listening...'),
        Match.when('thinking', () => 'Thinking...'),
        Match.when('speaking', () => 'Speaking...'),
        Match.orElse(() => null)
      )}
    </p>
  )
}

export function Transcript() {
  const { messages, scrollRef, bottomRef } = useTranscript()

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-foreground/40">Start speaking...</p>
        ) : (
          messages.map((msg) => <TranscriptMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
      <AgentIndicator />
    </div>
  )
}
