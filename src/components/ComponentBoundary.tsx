'use client'

import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

function DefaultFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Something went wrong</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Try again
      </button>
    </div>
  )
}

export function ComponentBoundary({
  name,
  children,
  fallback
}: {
  name: string
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ErrorBoundary
      FallbackComponent={fallback !== undefined ? () => <>{fallback}</> : DefaultFallback}
      onError={(error, info) => {
        console.error(`[ComponentBoundary:${name}]`, error, info.componentStack)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
