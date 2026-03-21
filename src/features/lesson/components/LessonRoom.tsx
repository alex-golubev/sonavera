import { RoomAudioRenderer, SessionProvider, useAgent, useSession } from '@livekit/components-react'
import { Match } from 'effect'
import { TokenSource } from 'livekit-client'
import { useEffect, useMemo } from 'react'

const AGENT_TIMEOUT_MS = 15_000

function AgentStatus() {
  const { state, failureReasons } = useAgent()
  return (
    <p className="text-sm font-mono text-foreground/60">
      {Match.value(state).pipe(
        Match.when('failed', () => `Agent failed: ${failureReasons?.join(', ')}`),
        Match.orElse((s) => s)
      )}
    </p>
  )
}

export function LessonRoom({ url, token }: { url: string; token: string }) {
  const tokenSource = useMemo(() => TokenSource.literal({ serverUrl: url, participantToken: token }), [url, token])
  const session = useSession(tokenSource, { agentConnectTimeoutMilliseconds: AGENT_TIMEOUT_MS })

  useEffect(() => {
    session.start({ tracks: { microphone: { enabled: true } } })
  }, [session.start])

  return (
    <SessionProvider session={session}>
      <RoomAudioRenderer />
      <AgentStatus />
    </SessionProvider>
  )
}
